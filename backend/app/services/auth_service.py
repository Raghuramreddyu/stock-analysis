import os

from datetime import datetime, timedelta

from dotenv import load_dotenv

from jose import jwt

from passlib.context import CryptContext

from pymongo import ReturnDocument

from app.database.mongodb import (
    db,
    users_collection
)


load_dotenv()


# ============================================================
# JWT Configuration
# ============================================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# ============================================================
# Password Configuration
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ============================================================
# Password Functions
# ============================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    password: str,
    password_hash: str
) -> bool:

    return pwd_context.verify(
        password,
        password_hash
    )


# ============================================================
# Sequential User ID
# ============================================================

def get_next_user_id() -> int:

    counters_collection = db["counters"]

    result = counters_collection.find_one_and_update(
        {"_id": "user_id"},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    return result["sequence"]


# ============================================================
# JWT Access Token
# ============================================================

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# Register User
# ============================================================

def register_user(
    name: str,
    email: str,
    password: str,
    role: str = "user"
):

    email = email.lower().strip()

    existing_user = users_collection.find_one(
        {
            "email": email
        }
    )

    if existing_user:
        return None

    user_id = get_next_user_id()

    password_hash = hash_password(password)

    user = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(user)

    return {
        "user_id": user_id,
        "name": name,
        "email": email,
        "role": role
    }


# ============================================================
# Authenticate User
# ============================================================

def authenticate_user(
    email: str,
    password: str
):

    user = users_collection.find_one(
        {
            "email": email.lower().strip()
        }
    )

    if not user:
        return None

    # New normalized field
    password_hash = user.get("password_hash")

    # Temporary compatibility with existing users
    # that may still have the old field.
    if password_hash is None:
        password_hash = user.get("passwordHash")

    if password_hash is None:
        return None

    if not verify_password(
        password,
        password_hash
    ):
        return None

    return user