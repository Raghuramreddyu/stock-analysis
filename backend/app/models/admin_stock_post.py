from datetime import datetime

from app.database.mongodb import db


admin_stock_posts_collection = db["admin_stock_posts"]


def create_admin_stock_post(
    stock_data: dict,
    admin_user: dict
):

    document = {
        "ticker": stock_data["ticker"],
        "price": stock_data["price"],
        "change": stock_data["change"],
        "changePercent": stock_data.get(
            "change_percent"
        ),
        "volumeChangePercent": stock_data.get(
            "volume_change_percent"
        ),
        "tradingDate": stock_data.get(
            "trading_date"
        ),
        "postedBy": admin_user["email"],
        "postedAt": datetime.utcnow(),
        "status": "published"
    }

    result = admin_stock_posts_collection.insert_one(
        document
    )

    return str(result.inserted_id)


def publish_multiple_stocks(
    stocks: list,
    admin_user: dict
):

    published = []
    duplicates = []
    failed = []

    for stock in stocks:

        ticker = stock.get("ticker")
        trading_date = stock.get("trading_date")

        if not ticker:
            failed.append({
                "ticker": ticker,
                "reason": "Missing ticker"
            })
            continue

        try:

            existing_stock = (
                admin_stock_posts_collection.find_one(
                    {
                        "ticker": ticker,
                        "tradingDate": trading_date,
                        "status": "published"
                    }
                )
            )

            if existing_stock:

                duplicates.append(ticker)

                continue

            document = {
                "ticker": ticker,
                "price": stock["price"],
                "change": stock["change"],
                "changePercent": stock.get(
                    "change_percent"
                ),
                "volumeChangePercent": stock.get(
                    "volume_change_percent"
                ),
                "tradingDate": trading_date,
                "postedBy": admin_user["email"],
                "postedAt": datetime.utcnow(),
                "status": "published"
            }

            result = (
                admin_stock_posts_collection.insert_one(
                    document
                )
            )

            published.append({
                "ticker": ticker,
                "id": str(result.inserted_id)
            })

        except Exception as e:

            failed.append({
                "ticker": ticker,
                "reason": str(e)
            })

    return {
        "published": published,
        "duplicates": duplicates,
        "failed": failed
    }


def get_published_stocks(
    trading_date=None
):

    query = {
        "status": "published"
    }

    if trading_date:
        query["tradingDate"] = trading_date

    stocks = list(
        admin_stock_posts_collection.find(
            query,
            {
                "_id": 0
            }
        ).sort(
            "postedAt",
            -1
        )
    )

    return stocks