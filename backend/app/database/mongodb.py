import os

from pymongo import MongoClient
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING


load_dotenv()

# Load MongoDB Atlas URI from .env
MONGODB_URI = os.getenv("MONGODB_URI")

# Load database name
DATABASE_NAME = os.getenv("DATABASE_NAME", "stock_analysis")


# Safe check - does not print your password
if MONGODB_URI:
    print("MongoDB URI loaded:", MONGODB_URI[:20] + "...")
else:
    print("MongoDB URI NOT loaded")


# Create MongoDB client
client = MongoClient(MONGODB_URI)

# Select database
db = client[DATABASE_NAME]

# Collections
stocks_collection = db["stocks"]
snapshots_collection = db["stock_snapshots"]
# Prevent duplicate stock records for the same trading day
snapshots_collection.create_index(
    [
        ("ticker", ASCENDING),
        ("tradingDate", ASCENDING)
    ],
    unique=True
)
stocks_collection = db["stocks"]
snapshots_collection = db["stock_snapshots"]
uploads_collection = db["uploads"]
users_collection = db["users"]

users_collection.create_index("email", unique=True)


def test_connection():
    try:
        client.admin.command("ping")
        print("MongoDB Atlas connected successfully!")
        return True

    except Exception as e:
        print("MongoDB connection failed:", e)
        return False