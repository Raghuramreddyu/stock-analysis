import os

from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv


load_dotenv()


# ============================================================
# MongoDB Configuration
# ============================================================

MONGODB_URI = os.getenv("MONGODB_URI")

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "stock_analysis"
)


# Safe check - does not print your password
if MONGODB_URI:
    print(
        "MongoDB URI loaded:",
        MONGODB_URI[:20] + "..."
    )
else:
    print("MongoDB URI NOT loaded")


# ============================================================
# MongoDB Client
# ============================================================

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]


# ============================================================
# Collections
# ============================================================

users_collection = db["users"]

stocks_collection = db["stocks"]

stock_market_data_collection = db["stock_market_data"]

admin_posts_collection = db["admin_posts"]


# ============================================================
# Indexes
# ============================================================


# ------------------------------------------------------------
# Users
# Prevent duplicate email addresses
# ------------------------------------------------------------

try:
    users_collection.create_index(
        "email",
        unique=True
    )
except Exception as e:
    print(
        f"Warning: Could not create users email index: {e}"
    )


# ------------------------------------------------------------
# Stocks
# Prevent duplicate ticker symbols
# ------------------------------------------------------------

try:
    stocks_collection.create_index(
        "ticker",
        unique=True
    )
except Exception as e:
    print(
        f"Warning: Could not create stocks ticker index: {e}"
    )


# ------------------------------------------------------------
# Stock Market Data
#
# One stock can have only one market-data record
# for a particular trading date.
# ------------------------------------------------------------

try:
    stock_market_data_collection.create_index(
        [
            ("stock_id", ASCENDING),
            ("trading_date", ASCENDING)
        ],
        unique=True
    )
except Exception as e:
    print(
        f"Warning: Could not create stock market data "
        f"index: {e}"
    )


# Useful for filtering market data by trading date
try:
    stock_market_data_collection.create_index(
        "trading_date"
    )
except Exception as e:
    print(
        f"Warning: Could not create trading date index: {e}"
    )


# Useful for finding all market data belonging to a stock
try:
    stock_market_data_collection.create_index(
        "stock_id"
    )
except Exception as e:
    print(
        f"Warning: Could not create stock ID index: {e}"
    )


# ------------------------------------------------------------
# Admin Posts
#
# Prevent the same stock + market-data record from being
# published more than once while its status is "published".
# ------------------------------------------------------------

try:
    admin_posts_collection.create_index(
        [
            ("stock_id", ASCENDING),
            ("market_data_id", ASCENDING)
        ],
        unique=True,
        partialFilterExpression={
            "status": "published"
        }
    )
except Exception as e:
    print(
        f"Warning: Could not create admin posts "
        f"unique index: {e}"
    )


# Useful for finding posts by stock
try:
    admin_posts_collection.create_index(
        [
            ("stock_id", ASCENDING),
            ("published_at", ASCENDING)
        ]
    )
except Exception as e:
    print(
        f"Warning: Could not create admin posts "
        f"stock index: {e}"
    )


# Useful for finding posts by admin
try:
    admin_posts_collection.create_index(
        "admin_id"
    )
except Exception as e:
    print(
        f"Warning: Could not create admin posts "
        f"admin index: {e}"
    )


# Useful for finding published posts by status
try:
    admin_posts_collection.create_index(
        "status"
    )
except Exception as e:
    print(
        f"Warning: Could not create admin posts "
        f"status index: {e}"
    )


# ============================================================
# MongoDB Connection Test
# ============================================================

def test_connection():
    try:
        client.admin.command("ping")

        print(
            "MongoDB Atlas connected successfully!"
        )

        return True

    except Exception as e:
        print(
            "MongoDB connection failed:",
            e
        )

        return False