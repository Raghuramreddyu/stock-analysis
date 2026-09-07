from datetime import datetime

from bson import ObjectId

from app.database.mongodb import (
    db,
    stocks_collection,
    stock_quotes_collection,
    stock_reports_collection,
    admin_operations_collection,
)


# ============================================================
# Legacy Admin Stock Posts Collection
# ============================================================
#
# Kept here so existing code does not break.
# New user-facing stock data comes from:
#
#     stocks
#     stock_quotes
#     stock_reports
#
# rather than this collection.
#

admin_stock_posts_collection = db["admin_stock_posts"]


# ============================================================
# Publish Single Stock
# ============================================================

def create_admin_stock_post(
    stock_data: dict,
    admin_user: dict
):
    """
    Legacy admin stock publication.

    Kept for compatibility with the existing admin route.

    The preferred architecture is to use the real:
        stocks
        stock_quotes
        stock_reports
    collections.
    """

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
        "postedBy": admin_user.get(
            "email"
        ),
        "postedAt": datetime.utcnow(),
        "status": "published",
    }

    result = admin_stock_posts_collection.insert_one(
        document
    )

    return str(result.inserted_id)


# ============================================================
# Publish Multiple Stocks
# ============================================================

def publish_multiple_stocks(
    stocks: list,
    admin_user: dict
):
    """
    Legacy bulk stock publication.

    Kept for compatibility with the existing admin route.
    """

    published = []
    duplicates = []
    failed = []

    for stock in stocks:

        ticker = stock.get("ticker")
        trading_date = stock.get("trading_date")

        if not ticker:

            failed.append({
                "ticker": ticker,
                "reason": "Missing ticker",
            })

            continue

        try:

            existing_stock = (
                admin_stock_posts_collection.find_one(
                    {
                        "ticker": ticker,
                        "tradingDate": trading_date,
                        "status": "published",
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
                "postedBy": admin_user.get(
                    "email"
                ),
                "postedAt": datetime.utcnow(),
                "status": "published",
            }

            result = (
                admin_stock_posts_collection.insert_one(
                    document
                )
            )

            published.append({
                "ticker": ticker,
                "id": str(
                    result.inserted_id
                ),
            })

        except Exception as exc:

            failed.append({
                "ticker": ticker,
                "reason": str(exc),
            })

    return {
        "published": published,
        "duplicates": duplicates,
        "failed": failed,
    }


# ============================================================
# Get Published Stocks
# ============================================================

def get_published_stocks(
    trading_date: str | None = None
):
    """
    Return stocks visible to normal users.

    A stock is visible only when it has a published report.

    Data is assembled from:

        stocks
        stock_quotes
        stock_reports

    This means the user-facing feed uses the actual
    stock master/current market-data architecture.
    """

    # --------------------------------------------------------
    # Find published reports
    # --------------------------------------------------------

    report_query = {
        "status": "published"
    }

    if trading_date:
        report_query["trading_date"] = trading_date

    reports = list(
        stock_reports_collection.find(
            report_query
        ).sort(
            "published_at",
            -1
        )
    )

    if not reports:
        return []

    # --------------------------------------------------------
    # Build user-facing stock records
    # --------------------------------------------------------

    stocks = []

    for report in reports:

        stock_id = report.get(
            "stock_id"
        )

        if not stock_id:
            continue

        # ----------------------------------------------------
        # Stock master
        # ----------------------------------------------------

        stock = stocks_collection.find_one(
            {
                "_id": stock_id
            }
        )

        if not stock:
            continue

        # ----------------------------------------------------
        # Current quote
        # ----------------------------------------------------

        quote = stock_quotes_collection.find_one(
            {
                "stock_id": stock_id
            }
        )

        # ----------------------------------------------------
        # Trading date
        # ----------------------------------------------------

        report_trading_date = report.get(
            "trading_date"
        )

        # ----------------------------------------------------
        # Build response
        # ----------------------------------------------------

        item = {
            "ticker": stock.get(
                "ticker"
            ),

            "company_name": stock.get(
                "company_name"
            ),

            "exchange": stock.get(
                "exchange"
            ),

            "currency": stock.get(
                "currency"
            ),

            "security_type": stock.get(
                "security_type"
            ),

            "sector": stock.get(
                "sector"
            ),

            "industry": stock.get(
                "industry"
            ),

            "status": stock.get(
                "status"
            ),

            # Current quote
            "price": (
                quote.get("price")
                if quote
                else None
            ),

            "change": (
                quote.get("change")
                if quote
                else None
            ),

            "change_percent": (
                quote.get(
                    "change_percent"
                )
                if quote
                else None
            ),

            "volume": (
                quote.get("volume")
                if quote
                else None
            ),

            "volume_change_percent": (
                quote.get(
                    "volume_change_percent"
                )
                if quote
                else None
            ),

            "open": (
                quote.get("open")
                if quote
                else None
            ),

            "high": (
                quote.get("high")
                if quote
                else None
            ),

            "low": (
                quote.get("low")
                if quote
                else None
            ),

            "previous_close": (
                quote.get(
                    "previous_close"
                )
                if quote
                else None
            ),

            "market_timestamp": (
                quote.get(
                    "market_timestamp"
                )
                if quote
                else None
            ),

            "quote_source": (
                quote.get("source")
                if quote
                else None
            ),

            # Report information
            "report_id": str(
                report["_id"]
            ),

            "report_title": report.get(
                "title"
            ),

            "report_summary": report.get(
                "summary"
            ),

            "report_status": report.get(
                "status"
            ),

            "trading_date": (
                report_trading_date
            ),

            "published_at": report.get(
                "published_at"
            ),
        }

        # ----------------------------------------------------
        # Convert ObjectIds
        # ----------------------------------------------------

        stocks.append(
            serialize_document(item)
        )

    return stocks


# ============================================================
# Publish Stock Report
# ============================================================

def publish_stock_report(
    stock_id: str,
    report_id: str,
    admin_user: dict,
):
    """
    Publish an existing stock report.

    Market data remains in:

        stocks
        stock_quotes
        stock_quote_history

    Report remains in:

        stock_reports

    Publication is recorded in:

        admin_operations
    """

    if not ObjectId.is_valid(
        stock_id
    ):

        raise ValueError(
            "Invalid stock_id"
        )

    if not ObjectId.is_valid(
        report_id
    ):

        raise ValueError(
            "Invalid report_id"
        )

    admin_id = admin_user.get(
        "_id",
        admin_user.get("user_id")
    )

    if not admin_id:

        raise ValueError(
            "Invalid admin user"
        )

    if not ObjectId.is_valid(
        str(admin_id)
    ):

        raise ValueError(
            "Invalid admin user ID"
        )

    stock_object_id = ObjectId(
        stock_id
    )

    report_object_id = ObjectId(
        report_id
    )

    admin_object_id = ObjectId(
        str(admin_id)
    )

    # --------------------------------------------------------
    # Verify stock
    # --------------------------------------------------------

    stock = stocks_collection.find_one(
        {
            "_id": stock_object_id
        }
    )

    if not stock:

        raise ValueError(
            "Stock not found"
        )

    # --------------------------------------------------------
    # Verify report
    # --------------------------------------------------------

    report = stock_reports_collection.find_one(
        {
            "_id": report_object_id,
            "stock_id": stock_object_id,
        }
    )

    if not report:

        raise ValueError(
            "Stock report not found"
        )

    # --------------------------------------------------------
    # Already published
    # --------------------------------------------------------

    if report.get(
        "status"
    ) == "published":

        return {
            "report_id": report_id,
            "stock_id": stock_id,
            "status": "published",
            "published_at": report.get(
                "published_at"
            ),
            "published_by": (
                str(
                    report["published_by"]
                )
                if report.get(
                    "published_by"
                )
                else None
            ),
        }

    now = datetime.utcnow()

    # --------------------------------------------------------
    # Publish report
    # --------------------------------------------------------

    stock_reports_collection.update_one(
        {
            "_id": report_object_id
        },
        {
            "$set": {
                "status": "published",
                "published_at": now,
                "published_by": admin_object_id,
                "updated_at": now,
            }
        }
    )

    # --------------------------------------------------------
    # Audit operation
    # --------------------------------------------------------

    admin_operations_collection.insert_one(
        {
            "admin_user_id": admin_object_id,
            "operation": "PUBLISH_REPORT",
            "resource_type": "stock_report",
            "resource_id": report_object_id,

            "previous_state": {
                "status": report.get(
                    "status"
                )
            },

            "new_state": {
                "status": "published",
                "published_at": now,
            },

            "created_at": now,
        }
    )

    return {
        "report_id": report_id,
        "stock_id": stock_id,
        "status": "published",
        "published_at": now,
        "published_by": str(
            admin_object_id
        ),
    }


# ============================================================
# Unpublish Stock Report
# ============================================================

def unpublish_stock_report(
    report_id: str,
    admin_user: dict,
):
    """
    Move a published report back to draft.
    """

    if not ObjectId.is_valid(
        report_id
    ):

        raise ValueError(
            "Invalid report_id"
        )

    admin_id = admin_user.get(
        "_id",
        admin_user.get("user_id")
    )

    if not admin_id:

        raise ValueError(
            "Invalid admin user"
        )

    if not ObjectId.is_valid(
        str(admin_id)
    ):

        raise ValueError(
            "Invalid admin user ID"
        )

    report_object_id = ObjectId(
        report_id
    )

    admin_object_id = ObjectId(
        str(admin_id)
    )

    # --------------------------------------------------------
    # Find report
    # --------------------------------------------------------

    report = stock_reports_collection.find_one(
        {
            "_id": report_object_id
        }
    )

    if not report:

        raise ValueError(
            "Stock report not found"
        )

    now = datetime.utcnow()

    # --------------------------------------------------------
    # Unpublish
    # --------------------------------------------------------

    stock_reports_collection.update_one(
        {
            "_id": report_object_id
        },
        {
            "$set": {
                "status": "draft",
                "updated_at": now,
            },

            "$unset": {
                "published_at": "",
                "published_by": "",
            },
        }
    )

    # --------------------------------------------------------
    # Audit operation
    # --------------------------------------------------------

    admin_operations_collection.insert_one(
        {
            "admin_user_id": admin_object_id,
            "operation": "UNPUBLISH_REPORT",
            "resource_type": "stock_report",
            "resource_id": report_object_id,

            "previous_state": {
                "status": report.get(
                    "status"
                )
            },

            "new_state": {
                "status": "draft"
            },

            "created_at": now,
        }
    )

    return {
        "report_id": report_id,
        "status": "draft",
    }


# ============================================================
# Get Published Reports
# ============================================================

def get_published_reports(
    stock_id: str | None = None,
):
    """
    Return only published reports.

    Normal users should never receive draft reports.
    """

    query = {
        "status": "published"
    }

    # --------------------------------------------------------
    # Optional stock filter
    # --------------------------------------------------------

    if stock_id:

        if not ObjectId.is_valid(
            stock_id
        ):

            raise ValueError(
                "Invalid stock_id"
            )

        query["stock_id"] = ObjectId(
            stock_id
        )

    # --------------------------------------------------------
    # Query
    # --------------------------------------------------------

    reports = list(
        stock_reports_collection.find(
            query
        ).sort(
            "published_at",
            -1
        )
    )

    # --------------------------------------------------------
    # Serialize
    # --------------------------------------------------------

    return [
        serialize_document(report)
        for report in reports
    ]


# ============================================================
# Serialization Helper
# ============================================================

def serialize_document(
    document: dict
):
    """
    Recursively convert MongoDB ObjectIds
    and datetime values into JSON-safe values.
    """

    if isinstance(
        document,
        ObjectId
    ):

        return str(
            document
        )

    if isinstance(
        document,
        datetime
    ):

        return document.isoformat()

    if isinstance(
        document,
        dict
    ):

        return {
            key: serialize_document(value)
            for key, value in document.items()
        }

    if isinstance(
        document,
        list
    ):

        return [
            serialize_document(item)
            for item in document
        ]

    return document