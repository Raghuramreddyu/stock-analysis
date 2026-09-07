from datetime import datetime, timezone

from bson import ObjectId

from app.database.mongodb import (
    stock_quote_history_collection,
)


# ============================================================
# Helpers
# ============================================================

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================
# Insert Historical Quote
# ============================================================

def record_stock_quote(
    stock_id: ObjectId,
    price: float,
    market_timestamp: datetime,
    change: float | None = None,
    change_percent: float | None = None,
    volume: int | None = None,
    volume_change_percent: float | None = None,
    open_price: float | None = None,
    high_price: float | None = None,
    low_price: float | None = None,
    previous_close: float | None = None,
    source: str = "finnhub",
):
    """
    Record one historical market observation.

    This function INSERTS a new observation.

    Unlike stock_quotes, historical records are never
    overwritten when a new market update arrives.
    """

    if price < 0:
        raise ValueError(
            "Price cannot be negative."
        )

    document = {
        "stock_id": stock_id,

        # Timestamp supplied by the market-data provider.
        "market_timestamp": market_timestamp,

        # Time our backend received/processed the event.
        "received_at": _utc_now(),

        "price": price,
        "change": change,
        "change_percent": change_percent,
        "volume": volume,
        "volume_change_percent": volume_change_percent,
        "open": open_price,
        "high": high_price,
        "low": low_price,
        "previous_close": previous_close,
        "source": source,
    }

    result = stock_quote_history_collection.insert_one(
        document
    )

    document["_id"] = result.inserted_id

    return document


# ============================================================
# Get Historical Quotes
# ============================================================

def get_stock_quote_history(
    stock_id: ObjectId,
    start_time: datetime,
    end_time: datetime,
    limit: int = 5000,
):
    """
    Return historical observations for one stock
    within a specific time range.
    """

    if start_time >= end_time:
        raise ValueError(
            "start_time must be before end_time."
        )

    if limit <= 0:
        raise ValueError(
            "limit must be greater than zero."
        )

    if limit > 50000:
        limit = 50000

    cursor = (
        stock_quote_history_collection.find(
            {
                "stock_id": stock_id,
                "market_timestamp": {
                    "$gte": start_time,
                    "$lte": end_time,
                },
            }
        )
        .sort(
            "market_timestamp",
            1,
        )
        .limit(limit)
    )

    return list(cursor)


# ============================================================
# Get Latest Historical Observation
# ============================================================

def get_latest_historical_quote(
    stock_id: ObjectId,
):
    """
    Return the latest historical observation for a stock.
    """

    return stock_quote_history_collection.find_one(
        {
            "stock_id": stock_id,
        },
        sort=[
            (
                "market_timestamp",
                -1,
            )
        ],
    )