from fastapi import APIRouter
from app.database.mongodb import snapshots_collection


router = APIRouter()


@router.get("/stocks")
def get_stocks():

    stocks = list(
        snapshots_collection.find(
            {},
            {
                "_id": 0
            }
        ).sort("tradingDate", -1)
    )

    return {
        "count": len(stocks),
        "stocks": stocks
    }


@router.get("/stocks/date/{trading_date}")
def get_stocks_by_date(trading_date: str):

    stocks = list(
        snapshots_collection.find(
            {
                "tradingDate": trading_date
            },
            {
                "_id": 0
            }
        ).sort("ticker", 1)
    )

    return {
        "tradingDate": trading_date,
        "count": len(stocks),
        "stocks": stocks
    }


@router.get("/stocks/{ticker}/history")
def get_stock_history(ticker: str):

    stocks = list(
        snapshots_collection.find(
            {
                "ticker": ticker.upper()
            },
            {
                "_id": 0
            }
        ).sort("tradingDate", 1)
    )

    return {
        "ticker": ticker.upper(),
        "count": len(stocks),
        "history": stocks
    }