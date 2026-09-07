from datetime import datetime, time, timezone

from fastapi import APIRouter, HTTPException

from app.services.finnhub_service import sync_stock_from_finnhub

from app.database.mongodb import (
    stocks_collection,
    stock_quotes_collection,
    stock_quote_history_collection,
)


router = APIRouter()


# ============================================================
# GET CURRENT STOCKS
# ============================================================

@router.get("/stocks")
def get_stocks():
    """
    Return the current stock universe with the latest quote.

    Master information comes from `stocks`.
    Current market information comes from `stock_quotes`.
    """

    pipeline = [
        {
            "$match": {
                "status": "active"
            }
        },

        {
            "$lookup": {
                "from": "stock_quotes",
                "localField": "_id",
                "foreignField": "stock_id",
                "as": "quote",
            }
        },

        {
            "$unwind": {
                "path": "$quote",
                "preserveNullAndEmptyArrays": True,
            }
        },

        {
            "$project": {
                "_id": 0,

                "ticker": 1,
                "company_name": 1,
                "exchange": 1,
                "currency": 1,
                "security_type": 1,
                "sector": 1,
                "industry": 1,
                "status": 1,

                "price": "$quote.price",
                "change": "$quote.change",
                "change_percent": "$quote.change_percent",
                "volume": "$quote.volume",
                "volume_change_percent": (
                    "$quote.volume_change_percent"
                ),
                "open": "$quote.open",
                "high": "$quote.high",
                "low": "$quote.low",
                "previous_close": (
                    "$quote.previous_close"
                ),
                "market_timestamp": (
                    "$quote.market_timestamp"
                ),
                "quote_source": "$quote.source",
            }
        },

        {
            "$sort": {
                "ticker": 1
            }
        },
    ]

    stocks = list(
        stocks_collection.aggregate(
            pipeline
        )
    )

    return {
        "count": len(stocks),
        "stocks": stocks,
    }


# ============================================================
# GET STOCKS BY DATE
# ============================================================

@router.get("/stocks/date/{trading_date}")
def get_stocks_by_date(
    trading_date: str,
):
    """
    Return the latest observation for each stock
    on a particular UTC calendar date.

    Expected format:

        YYYY-MM-DD

    Example:

        /stocks/date/2026-09-08
    """

    try:

        date_value = datetime.strptime(
            trading_date,
            "%Y-%m-%d",
        ).date()

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid date format. "
                "Use YYYY-MM-DD."
            ),
        )


    start_datetime = datetime.combine(
        date_value,
        time.min,
        tzinfo=timezone.utc,
    )

    end_datetime = datetime.combine(
        date_value,
        time.max,
        tzinfo=timezone.utc,
    )


    # --------------------------------------------------------
    # Get the latest observation for each stock on this date.
    # --------------------------------------------------------

    pipeline = [

        {
            "$match": {
                "market_timestamp": {
                    "$gte": start_datetime,
                    "$lte": end_datetime,
                }
            }
        },

        {
            "$sort": {
                "market_timestamp": -1
            }
        },

        {
            "$group": {
                "_id": "$stock_id",
                "observation": {
                    "$first": "$$ROOT"
                },
            }
        },

        {
            "$replaceRoot": {
                "newRoot": "$observation"
            }
        },

        {
            "$lookup": {
                "from": "stocks",
                "localField": "stock_id",
                "foreignField": "_id",
                "as": "stock",
            }
        },

        {
            "$unwind": {
                "path": "$stock",
                "preserveNullAndEmptyArrays": False,
            }
        },

        {
            "$project": {
                "_id": 0,

                "ticker": "$stock.ticker",
                "company_name": "$stock.company_name",
                "exchange": "$stock.exchange",

                "price": 1,
                "change": 1,
                "change_percent": 1,
                "volume": 1,
                "volume_change_percent": 1,

                "market_timestamp": 1,
                "source": 1,
            }
        },

        {
            "$sort": {
                "ticker": 1
            }
        },
    ]


    stocks = list(
        stock_quote_history_collection.aggregate(
            pipeline
        )
    )


    return {
        "trading_date": trading_date,
        "count": len(stocks),
        "stocks": stocks,
    }

# ============================================================
# TEST FINNHUB SYNCHRONIZATION
# ============================================================

@router.post("/stocks/{ticker}/sync")
def sync_stock(
    ticker: str,
):
    """
    Fetch one stock from Finnhub and synchronize it
    with MongoDB.

    This endpoint is intended for controlled testing.
    """

    try:

        result = sync_stock_from_finnhub(
            ticker
        )

        return {
            "message": (
                "Stock synchronized successfully"
            ),
            **result,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )


# ============================================================
# GET STOCK HISTORY
# ============================================================

@router.get("/stocks/{ticker}/history")
def get_stock_history(
    ticker: str,
):
    """
    Return historical market observations for a stock.
    """

    ticker = ticker.strip().upper()


    # --------------------------------------------------------
    # Resolve ticker -> stock
    # --------------------------------------------------------

    stock = stocks_collection.find_one(
        {
            "ticker": ticker,
            "status": "active",
        },
        {
            "_id": 1,
            "ticker": 1,
            "company_name": 1,
            "exchange": 1,
            "currency": 1,
        },
    )


    if not stock:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Stock '{ticker}' not found."
            ),
        )


    # --------------------------------------------------------
    # Historical observations
    # --------------------------------------------------------

    history = list(
        stock_quote_history_collection.find(
            {
                "stock_id": stock["_id"],
            },
            {
                "_id": 0,
                "market_timestamp": 1,
                "received_at": 1,
                "price": 1,
                "change": 1,
                "change_percent": 1,
                "volume": 1,
                "volume_change_percent": 1,
                "open": 1,
                "high": 1,
                "low": 1,
                "previous_close": 1,
                "source": 1,
            },
        ).sort(
            "market_timestamp",
            1,
        )
    )


    return {
        "ticker": ticker,
        "company_name": stock.get(
            "company_name"
        ),
        "exchange": stock.get(
            "exchange"
        ),
        "currency": stock.get(
            "currency"
        ),
        "count": len(history),
        "history": history,
    }