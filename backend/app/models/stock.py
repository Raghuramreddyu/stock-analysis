from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.database.mongodb import stocks_collection


# ============================================================
# Stock Status
# ============================================================

STATUS_ACTIVE = "active"
STATUS_INACTIVE = "inactive"

VALID_STATUSES = {
    STATUS_ACTIVE,
    STATUS_INACTIVE,
}


# ============================================================
# Security Types
# ============================================================

SECURITY_TYPE_COMMON_STOCK = "common_stock"
SECURITY_TYPE_ETF = "etf"
SECURITY_TYPE_ADR = "adr"
SECURITY_TYPE_OTHER = "other"

VALID_SECURITY_TYPES = {
    SECURITY_TYPE_COMMON_STOCK,
    SECURITY_TYPE_ETF,
    SECURITY_TYPE_ADR,
    SECURITY_TYPE_OTHER,
}


# ============================================================
# Helpers
# ============================================================

def normalize_ticker(ticker: str) -> str:
    """
    Normalize ticker symbols before storing/querying them.
    """

    return ticker.strip().upper()


# ============================================================
# Create Stock
# ============================================================

def create_stock(
    ticker: str,
    company_name: str,
    exchange: str,
    currency: str = "USD",
    security_type: str = SECURITY_TYPE_COMMON_STOCK,
    sector: str | None = None,
    industry: str | None = None,
):
    """
    Create a stock master record.

    This collection contains security/master information only.

    Real-time price information does NOT belong here.
    """

    ticker = normalize_ticker(ticker)
    company_name = company_name.strip()
    exchange = exchange.strip().upper()
    currency = currency.strip().upper()

    if not ticker:
        raise ValueError("Ticker cannot be empty.")

    if not company_name:
        raise ValueError(
            "Company name cannot be empty."
        )

    if not exchange:
        raise ValueError(
            "Exchange cannot be empty."
        )

    if not currency:
        raise ValueError(
            "Currency cannot be empty."
        )

    if security_type not in VALID_SECURITY_TYPES:
        raise ValueError(
            f"Invalid security type: {security_type}"
        )

    now = datetime.now(timezone.utc)

    stock_document = {
        "ticker": ticker,
        "company_name": company_name,
        "exchange": exchange,
        "currency": currency,
        "security_type": security_type,
        "sector": sector,
        "industry": industry,
        "status": STATUS_ACTIVE,
        "created_at": now,
        "updated_at": now,
    }

    try:

        result = stocks_collection.insert_one(
            stock_document
        )

    except DuplicateKeyError:

        return None

    stock_document["_id"] = result.inserted_id

    return stock_document


# ============================================================
# Find Stock
# ============================================================

def get_stock_by_ticker(ticker: str):
    """
    Find a stock using its ticker.
    """

    return stocks_collection.find_one(
        {
            "ticker": normalize_ticker(ticker)
        }
    )


def get_stock_by_id(stock_id):
    """
    Find a stock using its MongoDB ObjectId.
    """

    return stocks_collection.find_one(
        {
            "_id": stock_id
        }
    )


# ============================================================
# List Stocks
# ============================================================

def get_active_stocks():
    """
    Return all currently active stocks.
    """

    return list(
        stocks_collection.find(
            {
                "status": STATUS_ACTIVE
            }
        ).sort(
            "ticker",
            1
        )
    )


# ============================================================
# Update Stock
# ============================================================

def update_stock(
    stock_id,
    updates: dict,
):
    """
    Update permitted stock master-data fields.

    Market price/volume fields must NOT be updated here.
    """

    allowed_fields = {
        "company_name",
        "exchange",
        "currency",
        "security_type",
        "sector",
        "industry",
        "status",
    }

    clean_updates = {
        key: value
        for key, value in updates.items()
        if key in allowed_fields
    }

    if not clean_updates:
        return False

    if "security_type" in clean_updates:
        if (
            clean_updates["security_type"]
            not in VALID_SECURITY_TYPES
        ):
            raise ValueError(
                "Invalid security type."
            )

    if "status" in clean_updates:
        if (
            clean_updates["status"]
            not in VALID_STATUSES
        ):
            raise ValueError(
                "Invalid stock status."
            )

    clean_updates["updated_at"] = (
        datetime.now(timezone.utc)
    )

    result = stocks_collection.update_one(
        {
            "_id": stock_id
        },
        {
            "$set": clean_updates
        },
    )

    return result.modified_count > 0