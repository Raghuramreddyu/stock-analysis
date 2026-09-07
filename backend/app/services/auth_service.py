import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

from app.models.user import (
    create_user,
    get_user_by_email,
)


# ============================================================
# Environment Configuration
# ============================================================

load_dotenv()


SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is not configured."
    )


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
    """
    Hash a plain-text password using bcrypt.

    Plain-text passwords must never be stored in MongoDB.
    """

    return pwd_context.hash(password)


def verify_password(
    password: str,
    password_hash: str
) -> bool:
    """
    Verify a password against its bcrypt hash.
    """

    return pwd_context.verify(
        password,
        password_hash
    )


# ============================================================
# JWT
# ============================================================

def create_access_token(data: dict) -> str:
    """
    Create a signed JWT access token.
    """

    to_encode = data.copy()

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
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
# Registration
# ============================================================

def register_user(
    name: str,
    email: str,
    password: str,
    role: str = "user"
):
    """
    Register a new user.

    Business responsibilities:
        1. Normalize input
        2. Check whether user exists
        3. Hash password
        4. Delegate persistence to user model
    """

    email = email.strip().lower()

    existing_user = get_user_by_email(
        email
    )

    if existing_user:
        return None

    password_hash = hash_password(
        password
    )

    user = create_user(
        name=name,
        email=email,
        password_hash=password_hash,
        role=role,
    )

    if user is None:
        return None

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


# ============================================================
# Authentication
# ============================================================

def authenticate_user(
    email: str,
    password: str
):
    """
    Authenticate a user using email and password.

    Disabled accounts cannot authenticate.
    """

    email = email.strip().lower()

    user = get_user_by_email(
        email
    )

    if not user:
        return None

    # --------------------------------------------------------
    # Account status
    # --------------------------------------------------------

    if user.get("status") != "active":
        return None

    # --------------------------------------------------------
    # Password verification
    # --------------------------------------------------------

    if not verify_password(
        password,
        user["password_hash"]
    ):
        return None

    return user