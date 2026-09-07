from fastapi import APIRouter

from app.database.mongodb import (
    stocks_collection,
    stock_market_data_collection,
)


router = APIRouter()


# ============================================================
# Get all stock market data
# ============================================================

@router.get("/stocks")
def get_stocks():

    pipeline = [
        {
            "$lookup": {
                "from": "stocks",
                "localField": "stock_id",
                "foreignField": "stock_id",
                "as": "stock",
            }
        },
        {
            "$unwind": "$stock"
        },
        {
            "$project": {
                "_id": 0,
                "stock_id": 1,
                "market_data_id": 1,
                "ticker": "$stock.ticker",
                "price": 1,
                "change": 1,
                "change_percent": 1,
                "volume_change_percent": 1,
                "trading_date": 1,
                "captured_at": 1,
            }
        },
        {
            "$sort": {
                "trading_date": -1
            }
        }
    ]

    stocks = list(
        stock_market_data_collection.aggregate(
            pipeline
        )
    )

    return {
        "count": len(stocks),
        "stocks": stocks,
    }


# ============================================================
# Get stocks by trading date
# ============================================================

@router.get("/stocks/date/{trading_date}")
def get_stocks_by_date(
    trading_date: str
):

    pipeline = [
        {
            "$match": {
                "trading_date": trading_date
            }
        },
        {
            "$lookup": {
                "from": "stocks",
                "localField": "stock_id",
                "foreignField": "stock_id",
                "as": "stock",
            }
        },
        {
            "$unwind": "$stock"
        },
        {
            "$project": {
                "_id": 0,
                "stock_id": 1,
                "market_data_id": 1,
                "ticker": "$stock.ticker",
                "price": 1,
                "change": 1,
                "change_percent": 1,
                "volume_change_percent": 1,
                "trading_date": 1,
                "captured_at": 1,
            }
        },
        {
            "$sort": {
                "ticker": 1
            }
        }
    ]

    stocks = list(
        stock_market_data_collection.aggregate(
            pipeline
        )
    )

    return {
        "trading_date": trading_date,
        "count": len(stocks),
        "stocks": stocks,
    }


# ============================================================
# Get stock history
# ============================================================

@router.get("/stocks/{ticker}/history")
def get_stock_history(
    ticker: str
):

    ticker = ticker.upper()

    pipeline = [
        {
            "$lookup": {
                "from": "stocks",
                "localField": "stock_id",
                "foreignField": "stock_id",
                "as": "stock",
            }
        },
        {
            "$unwind": "$stock"
        },
        {
            "$match": {
                "stock.ticker": ticker
            }
        },
        {
            "$project": {
                "_id": 0,
                "stock_id": 1,
                "market_data_id": 1,
                "ticker": "$stock.ticker",
                "price": 1,
                "change": 1,
                "change_percent": 1,
                "volume_change_percent": 1,
                "trading_date": 1,
                "captured_at": 1,
            }
        },
        {
            "$sort": {
                "trading_date": 1
            }
        }
    ]

    history = list(
        stock_market_data_collection.aggregate(
            pipeline
        )
    )

    return {
        "ticker": ticker,
        "count": len(history),
        "history": history,
    }