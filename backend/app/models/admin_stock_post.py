from datetime import datetime

from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import (
    stocks_collection,
    stock_market_data_collection,
    admin_posts_collection,
)


# ============================================================
# Create admin post
# ============================================================

def create_admin_stock_post(
    stock_data: dict,
    admin_user: dict
):
    """
    Create an admin post using references to existing
    stock and market-data records.
    """

    ticker = stock_data["ticker"].upper()
    trading_date = stock_data.get("trading_date")

    # --------------------------------------------------------
    # 1. Find the stock
    # --------------------------------------------------------

    stock = stocks_collection.find_one(
        {
            "ticker": ticker
        }
    )

    if not stock:
        raise ValueError(
            f"Stock not found: {ticker}"
        )

    stock_id = stock["stock_id"]

    # --------------------------------------------------------
    # 2. Find market data for this stock/date
    # --------------------------------------------------------

    market_data = stock_market_data_collection.find_one(
        {
            "stock_id": stock_id,
            "trading_date": trading_date,
        }
    )

    if not market_data:
        raise ValueError(
            f"Market data not found for {ticker} "
            f"on {trading_date}"
        )

    market_data_id = market_data[
        "market_data_id"
    ]

    # --------------------------------------------------------
    # 3. Get admin ID
    # --------------------------------------------------------

    admin_id = admin_user.get("user_id")

    if admin_id is None:
        raise ValueError(
            "Admin user ID not found"
        )

    # --------------------------------------------------------
    # 4. Check for existing published post
    # --------------------------------------------------------

    existing_post = admin_posts_collection.find_one(
        {
            "stock_id": stock_id,
            "market_data_id": market_data_id,
            "status": "published",
        }
    )

    if existing_post:
        raise DuplicateKeyError(
            "Stock has already been published"
        )

    # --------------------------------------------------------
    # 5. Generate sequential post ID
    # --------------------------------------------------------

    counters_collection = (
        admin_posts_collection.database["counters"]
    )

    counter = counters_collection.find_one_and_update(
        {
            "_id": "post_id"
        },
        {
            "$inc": {
                "sequence": 1
            }
        },
        upsert=True,
        return_document=True,
    )

    post_id = counter["sequence"]

    # --------------------------------------------------------
    # 6. Create admin post
    # --------------------------------------------------------

    document = {
        "post_id": post_id,
        "stock_id": stock_id,
        "market_data_id": market_data_id,
        "admin_id": admin_id,
        "published_at": datetime.utcnow(),
        "status": "published",
    }

    admin_posts_collection.insert_one(
        document
    )

    return post_id


# ============================================================
# Publish multiple stocks
# ============================================================

def publish_multiple_stocks(
    stocks: list,
    admin_user: dict
):
    published = []
    duplicates = []
    failed = []

    for stock in stocks:

        ticker = stock.get("ticker")

        if not ticker:
            failed.append(
                {
                    "ticker": ticker,
                    "reason": "Missing ticker",
                }
            )
            continue

        try:

            post_id = create_admin_stock_post(
                stock_data=stock,
                admin_user=admin_user,
            )

            published.append(
                {
                    "ticker": ticker.upper(),
                    "id": post_id,
                }
            )

        except DuplicateKeyError:

            duplicates.append(
                ticker.upper()
            )

        except Exception as e:

            failed.append(
                {
                    "ticker": ticker.upper(),
                    "reason": str(e),
                }
            )

    return {
        "published": published,
        "duplicates": duplicates,
        "failed": failed,
    }


# ============================================================
# Get published stocks
# ============================================================

def get_published_stocks(
    trading_date=None
):
    """
    Get published stocks by joining:
        admin_posts
        stocks
        stock_market_data
    """

    pipeline = []

    # --------------------------------------------------------
    # Filter published posts
    # --------------------------------------------------------

    pipeline.append(
        {
            "$match": {
                "status": "published"
            }
        }
    )

    # --------------------------------------------------------
    # Join with stocks
    # --------------------------------------------------------

    pipeline.append(
        {
            "$lookup": {
                "from": "stocks",
                "localField": "stock_id",
                "foreignField": "stock_id",
                "as": "stock",
            }
        }
    )

    pipeline.append(
        {
            "$unwind": "$stock"
        }
    )

    # --------------------------------------------------------
    # Join with market data
    # --------------------------------------------------------

    pipeline.append(
        {
            "$lookup": {
                "from": "stock_market_data",
                "localField": "market_data_id",
                "foreignField": "market_data_id",
                "as": "market_data",
            }
        }
    )

    pipeline.append(
        {
            "$unwind": "$market_data"
        }
    )

    # --------------------------------------------------------
    # Filter by trading date if provided
    # --------------------------------------------------------

    if trading_date:

        pipeline.append(
            {
                "$match": {
                    "market_data.trading_date":
                    trading_date
                }
            }
        )

    # --------------------------------------------------------
    # Return frontend-friendly structure
    # --------------------------------------------------------

    pipeline.append(
        {
            "$project": {
                "_id": 0,

                "post_id": 1,
                "stock_id": 1,
                "market_data_id": 1,
                "admin_id": 1,

                "ticker": "$stock.ticker",

                "price": "$market_data.price",

                "change": "$market_data.change",

                "change_percent":
                    "$market_data.change_percent",

                "volume_change_percent":
                    "$market_data.volume_change_percent",

                "trading_date":
                    "$market_data.trading_date",

                "published_at": 1,

                "status": 1,
            }
        }
    )

    # --------------------------------------------------------
    # Sort newest posts first
    # --------------------------------------------------------

    pipeline.append(
        {
            "$sort": {
                "published_at": -1
            }
        }
    )

    return list(
        admin_posts_collection.aggregate(
            pipeline
        )
    )