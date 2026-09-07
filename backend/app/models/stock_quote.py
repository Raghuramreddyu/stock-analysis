from datetime import datetime, timezone

from bson import ObjectId

from app.database.mongodb import stock_quotes_collection


# ============================================================
# Helpers
# ============================================================

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================
# Get Current Quote
# ============================================================

def get_quote_by_stock_id(stock_id: ObjectId):
    """
    Return the latest market quote for a stock.
    """

    return stock_quotes_collection.find_one(
        {
            "stock_id": stock_id
        }
    )


# ============================================================
# Upsert Current Quote
# ============================================================

def upsert_stock_quote(
    stock_id: ObjectId,
    price: float,
    change: float | None = None,
    change_percent: float | None = None,
    volume: int | None = None,
    volume_change_percent: float | None = None,
    open_price: float | None = None,
    high_price: float | None = None,
    low_price: float | None = None,
    previous_close: float | None = None,
    market_timestamp: datetime | None = None,
    source: str = "finnhub",
):
    """
    Insert or update the latest market quote for a stock.

    There must only be ONE current quote document per stock.

    Historical data belongs in stock_quote_history.
    """

    now = _utc_now()

    quote = {
        "price": price,
        "change": change,
        "change_percent": change_percent,
        "volume": volume,
        "volume_change_percent": volume_change_percent,
        "open": open_price,
        "high": high_price,
        "low": low_price,
        "previous_close": previous_close,
        "market_timestamp": market_timestamp,
        "source": source,
        "updated_at": now,
    }

    result = stock_quotes_collection.update_one(
        {
            "stock_id": stock_id
        },
        {
            "$set": quote,
            "$setOnInsert": {
                "stock_id": stock_id,
                "created_at": now,
            },
        },
        upsert=True,
    )

    return {
        "stock_id": stock_id,
        "updated": result.modified_count > 0,
        "inserted": result.upserted_id is not None,
    }


# ============================================================
# Get All Current Quotes
# ============================================================

def get_all_current_quotes():
    """
    Return current market quotes for the dashboard.
    """

    return list(
        stock_quotes_collection.find(
            {}
        )
    )


# ============================================================
# Get Top Gainers
# ============================================================

def get_top_gainers(limit: int = 10):
    """
    Return stocks with the highest percentage gains.
    """

    return list(
        stock_quotes_collection.find(
            {
                "change_percent": {
                    "$ne": None
                }
            }
        )
        .sort(
            "change_percent",
            -1
        )
        .limit(limit)
    )


# ============================================================
# Get Top Losers
# ============================================================

def get_top_losers(limit: int = 10):
    """
    Return stocks with the largest percentage losses.
    """

    return list(
        stock_quotes_collection.find(
            {
                "change_percent": {
                    "$ne": None
                }
            }
        )
        .sort(
            "change_percent",
            1
        )
        .limit(limit)
    )