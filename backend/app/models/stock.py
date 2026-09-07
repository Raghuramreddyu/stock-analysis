from datetime import datetime

from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import (
    stocks_collection,
    stock_market_data_collection,
)


# ============================================================
# Sequential ID Helper
# ============================================================

def get_next_sequence(sequence_name: str) -> int:
    """
    Generate the next sequential numeric ID.

    Examples:
        stock_id: 1, 2, 3, 4...
        market_data_id: 1, 2, 3, 4...
    """

    counters_collection = stocks_collection.database["counters"]

    result = counters_collection.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    return result["sequence"]


# ============================================================
# Save Stock and Market Data
# ============================================================

def save_stock_data(stock_data: dict):
    """
    Save a stock and its market data using a normalized structure.

    stocks:
        stock_id
        ticker

    stock_market_data:
        market_data_id
        stock_id
        trading_date
        price
        change
        change_percent
        volume_change_percent
        captured_at
    """

    ticker = stock_data["ticker"].upper()
    trading_date = stock_data["trading_date"]

    # --------------------------------------------------------
    # 1. Find existing stock
    # --------------------------------------------------------

    stock = stocks_collection.find_one(
        {
            "ticker": ticker
        }
    )

    if stock:
        stock_id = stock["stock_id"]

    else:
        # ----------------------------------------------------
        # 2. Create new stock
        # ----------------------------------------------------

        stock_id = get_next_sequence("stock_id")

        stock_document = {
            "stock_id": stock_id,
            "ticker": ticker,
        }

        try:
            stocks_collection.insert_one(
                stock_document
            )

        except DuplicateKeyError:
            # Another request may have created the
            # same ticker at the same time.

            stock = stocks_collection.find_one(
                {
                    "ticker": ticker
                }
            )

            if not stock:
                raise

            stock_id = stock["stock_id"]

    # --------------------------------------------------------
    # 3. Create market data record
    # --------------------------------------------------------

    market_data_id = get_next_sequence(
        "market_data_id"
    )

    market_data_document = {
        "market_data_id": market_data_id,
        "stock_id": stock_id,
        "trading_date": trading_date,
        "price": stock_data["price"],
        "change": stock_data["change"],
        "change_percent": stock_data["change_percent"],
        "volume_change_percent": stock_data.get(
            "volume_change_percent"
        ),
        "captured_at": datetime.utcnow(),
    }

    try:
        stock_market_data_collection.insert_one(
            market_data_document
        )

    except DuplicateKeyError:
        # The same stock already has market data
        # for this trading date.
        raise

    return {
        "stock_id": stock_id,
        "market_data_id": market_data_id,
        "ticker": ticker,
    }


# ============================================================
# Get Stock Market Data
# ============================================================

def get_stock_data(
    ticker: str,
    trading_date: str
):
    """
    Get market data for a stock on a particular date.
    """

    stock = stocks_collection.find_one(
        {
            "ticker": ticker.upper()
        },
        {
            "_id": 0
        }
    )

    if not stock:
        return None

    market_data = stock_market_data_collection.find_one(
        {
            "stock_id": stock["stock_id"],
            "trading_date": trading_date,
        },
        {
            "_id": 0
        }
    )

    if not market_data:
        return None

    return {
        "stock_id": stock["stock_id"],
        "ticker": stock["ticker"],
        "market_data_id": market_data["market_data_id"],
        "trading_date": market_data["trading_date"],
        "price": market_data["price"],
        "change": market_data["change"],
        "change_percent": market_data["change_percent"],
        "volume_change_percent": market_data.get(
            "volume_change_percent"
        ),
        "captured_at": market_data.get(
            "captured_at"
        ),
    }