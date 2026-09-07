import os

from dotenv import load_dotenv
from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.errors import CollectionInvalid, PyMongoError


load_dotenv()


# ============================================================
# Configuration
# ============================================================

MONGODB_URI = os.getenv("MONGODB_URI")

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "stock_analysis_v2",
)

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI is not configured in the environment."
    )


# ============================================================
# MongoDB Client
# ============================================================

client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000,
    retryWrites=True,
)


# ============================================================
# Database
# ============================================================

db = client[DATABASE_NAME]


# ============================================================
# Collection Names
# ============================================================

USERS_COLLECTION = "users"

STOCKS_COLLECTION = "stocks"

STOCK_QUOTES_COLLECTION = "stock_quotes"

STOCK_QUOTE_HISTORY_COLLECTION = "stock_quote_history"

STOCK_REPORTS_COLLECTION = "stock_reports"

ANALYST_RATINGS_COLLECTION = "analyst_ratings"

MARKET_EVENTS_COLLECTION = "market_events"

ADMIN_OPERATIONS_COLLECTION = "admin_operations"


# ============================================================
# Collections
# ============================================================

users_collection = db[
    USERS_COLLECTION
]

stocks_collection = db[
    STOCKS_COLLECTION
]

stock_quotes_collection = db[
    STOCK_QUOTES_COLLECTION
]

stock_quote_history_collection = db[
    STOCK_QUOTE_HISTORY_COLLECTION
]

stock_reports_collection = db[
    STOCK_REPORTS_COLLECTION
]

analyst_ratings_collection = db[
    ANALYST_RATINGS_COLLECTION
]

market_events_collection = db[
    MARKET_EVENTS_COLLECTION
]

admin_operations_collection = db[
    ADMIN_OPERATIONS_COLLECTION
]


# ============================================================
# Time-Series Collection
# ============================================================

def create_time_series_collection() -> None:
    """
    Create the historical market-data collection as a
    MongoDB time-series collection.

    One document represents one market observation.

    Example:

        stock_id
        market_timestamp
        price
        volume
        source
    """

    existing_collections = db.list_collection_names()

    if STOCK_QUOTE_HISTORY_COLLECTION in existing_collections:
        return

    try:

        db.create_collection(
            STOCK_QUOTE_HISTORY_COLLECTION,
            timeseries={
                "timeField": "market_timestamp",
                "metaField": "stock_id",
                "granularity": "seconds",
            },
        )

        print(
            "Created MongoDB time-series collection:",
            STOCK_QUOTE_HISTORY_COLLECTION,
        )

    except CollectionInvalid:

        # Collection may have been created by another
        # application instance at the same time.
        pass

    except PyMongoError as exc:

        print(
            "Failed to create time-series collection:",
            exc,
        )


# ============================================================
# Index Configuration
# ============================================================

def create_indexes() -> None:
    """
    Create indexes according to the application's
    query patterns.

    Indexes are intentionally kept limited on the
    high-write historical collection.
    """

    # ========================================================
    # USERS
    # ========================================================

    # One account per email.
    users_collection.create_index(
        [
            ("email", ASCENDING),
        ],
        unique=True,
        name="uq_users_email",
    )

    # Admin/user authorization queries.
    users_collection.create_index(
        [
            ("role", ASCENDING),
        ],
        name="idx_users_role",
    )

    # Active/disabled user filtering.
    users_collection.create_index(
        [
            ("status", ASCENDING),
        ],
        name="idx_users_status",
    )


    # ========================================================
    # STOCKS
    # ========================================================

    # One master document per ticker.
    stocks_collection.create_index(
        [
            ("ticker", ASCENDING),
        ],
        unique=True,
        name="uq_stocks_ticker",
    )

    # Filter stocks by exchange.
    stocks_collection.create_index(
        [
            ("exchange", ASCENDING),
        ],
        name="idx_stocks_exchange",
    )

    # Sector filtering.
    stocks_collection.create_index(
        [
            ("sector", ASCENDING),
        ],
        name="idx_stocks_sector",
    )

    # Active/inactive stock filtering.
    stocks_collection.create_index(
        [
            ("status", ASCENDING),
        ],
        name="idx_stocks_status",
    )


    # ========================================================
    # CURRENT STOCK QUOTES
    # ========================================================

    # Exactly one current quote per stock.
    stock_quotes_collection.create_index(
        [
            ("stock_id", ASCENDING),
        ],
        unique=True,
        name="uq_stock_quotes_stock_id",
    )

    # Dashboard freshness.
    stock_quotes_collection.create_index(
        [
            ("updated_at", DESCENDING),
        ],
        name="idx_stock_quotes_updated_at",
    )

    # Top gainers / losers.
    stock_quotes_collection.create_index(
        [
            ("change_percent", DESCENDING),
        ],
        name="idx_stock_quotes_change_percent",
    )


    # ========================================================
    # HISTORICAL TIME-SERIES DATA
    # ========================================================

    # Query pattern:
    #
    #   stock_id + market_timestamp
    #
    # Keep indexes minimal because this collection is
    # potentially the highest-write collection.
    stock_quote_history_collection.create_index(
        [
            ("stock_id", ASCENDING),
            ("market_timestamp", DESCENDING),
        ],
        name="idx_quote_history_stock_time",
    )


    # ========================================================
    # STOCK REPORTS
    # ========================================================

    # Get reports for a particular stock.
    stock_reports_collection.create_index(
        [
            ("stock_id", ASCENDING),
            ("published_at", DESCENDING),
        ],
        name="idx_reports_stock_published",
    )

    # Get published reports.
    stock_reports_collection.create_index(
        [
            ("status", ASCENDING),
            ("published_at", DESCENDING),
        ],
        name="idx_reports_status_published",
    )

    # Find reports created by an administrator/system user.
    stock_reports_collection.create_index(
        [
            ("created_by", ASCENDING),
        ],
        name="idx_reports_created_by",
    )


    # ========================================================
    # ANALYST RATINGS
    # ========================================================

    # Ratings for a particular stock ordered by date.
    analyst_ratings_collection.create_index(
        [
            ("stock_id", ASCENDING),
            ("published_at", DESCENDING),
        ],
        name="idx_ratings_stock_published",
    )

    # Find ratings by analyst/firm.
    analyst_ratings_collection.create_index(
        [
            ("analyst_firm", ASCENDING),
        ],
        name="idx_ratings_analyst_firm",
    )


    # ========================================================
    # MARKET EVENTS
    # ========================================================

    # Events belonging to a stock.
    market_events_collection.create_index(
        [
            ("stock_id", ASCENDING),
            ("occurred_at", DESCENDING),
        ],
        name="idx_events_stock_time",
    )

    # Events by type and time.
    market_events_collection.create_index(
        [
            ("event_type", ASCENDING),
            ("occurred_at", DESCENDING),
        ],
        name="idx_events_type_time",
    )


    # ========================================================
    # ADMIN OPERATIONS / AUDIT LOG
    # ========================================================

    # Find actions performed by a particular administrator.
    admin_operations_collection.create_index(
        [
            ("admin_user_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        name="idx_admin_operations_user_time",
    )

    # Find all operations affecting a particular resource.
    admin_operations_collection.create_index(
        [
            ("resource_type", ASCENDING),
            ("resource_id", ASCENDING),
        ],
        name="idx_admin_operations_resource",
    )

    # Recent administrative operations.
    admin_operations_collection.create_index(
        [
            ("created_at", DESCENDING),
        ],
        name="idx_admin_operations_created_at",
    )


# ============================================================
# Database Initialization
# ============================================================

def initialize_database() -> None:
    """
    Initialize MongoDB infrastructure.

    This function:
        1. Creates the historical time-series collection.
        2. Creates application indexes.

    It is safe to call during application startup.
    """

    create_time_series_collection()

    create_indexes()

    print(
        "Database initialization completed."
    )


# ============================================================
# Connection Test
# ============================================================

def test_connection() -> bool:
    """
    Test MongoDB connectivity.

    Returns:
        True  -> connection successful
        False -> connection failed
    """

    try:

        client.admin.command("ping")

        print(
            f"MongoDB connected successfully: "
            f"{DATABASE_NAME}"
        )

        return True

    except PyMongoError as exc:

        print(
            f"MongoDB connection failed: {exc}"
        )

        return False


# ============================================================
# Database Access
# ============================================================

def get_database():
    """
    Return the configured MongoDB database.
    """

    return db