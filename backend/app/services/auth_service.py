import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

from app.database.mongodb import users_collection


load_dotenv()


SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def register_user(
    name: str,
    email: str,
    password: str,
    role: str = "user"
):
    existing_user = users_collection.find_one(
        {"email": email.lower()}
    )

    if existing_user:
        return None

    password_hash = hash_password(password)

    user = {
        "name": name,
        "email": email.lower(),
        "passwordHash": password_hash,
        "role": role,
        "createdAt": datetime.utcnow()
    }

    result = users_collection.insert_one(user)

    return {
        "id": str(result.inserted_id),
        "name": name,
        "email": email.lower(),
        "role": role
    }


def authenticate_user(email: str, password: str):
    user = users_collection.find_one(
        {"email": email.lower()}
    )

    if not user:
        return None

    if not verify_password(
        password,
        user["passwordHash"]
    ):
        return None

    return user