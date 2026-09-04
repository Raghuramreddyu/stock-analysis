from datetime import datetime

from app.database.mongodb import db


admin_stock_posts_collection = db["admin_stock_posts"]


def create_admin_stock_post(stock_data: dict, admin_user: dict):
    document = {
        "ticker": stock_data["ticker"],
        "price": stock_data["price"],
        "change": stock_data["change"],
        "changePercent": stock_data.get("change_percent"),
        "volumeChangePercent": stock_data.get(
            "volume_change_percent"
        ),
        "tradingDate": stock_data.get("trading_date"),
        "postedBy": admin_user["email"],
        "postedAt": datetime.utcnow(),
        "status": "published"
    }

    result = admin_stock_posts_collection.insert_one(document)

    return str(result.inserted_id)


def get_published_stocks(trading_date=None):
    query = {
        "status": "published"
    }

    if trading_date:
        query["tradingDate"] = trading_date

    stocks = list(
        admin_stock_posts_collection.find(
            query,
            {"_id": 0}
        ).sort("postedAt", -1)
    )

    return stocks