from datetime import datetime

from app.database.mongodb import snapshots_collection


def save_stock_snapshot(stock_data: dict):

    document = {
        "ticker": stock_data["ticker"],
        "price": stock_data["price"],
        "change": stock_data["change"],
        "changePercent": stock_data["change_percent"],
        "volumeChangePercent": stock_data.get(
            "volume_change_percent"
        ),
        "tradingDate": stock_data["trading_date"],
        "capturedAt": datetime.utcnow()
    }

    result = snapshots_collection.insert_one(
        document
    )

    return str(result.inserted_id)


def get_stock_snapshot(
    ticker: str,
    trading_date: str
):

    return snapshots_collection.find_one(
        {
            "ticker": ticker,
            "tradingDate": trading_date
        },
        {
            "_id": 0
        }
    )