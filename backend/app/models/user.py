from datetime import datetime, timezone

from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import users_collection


# ============================================================
# User Roles
# ============================================================

ROLE_ADMIN = "admin"
ROLE_USER = "user"

VALID_ROLES = {
    ROLE_ADMIN,
    ROLE_USER,
}


# ============================================================
# User Status
# ============================================================

STATUS_ACTIVE = "active"
STATUS_DISABLED = "disabled"

VALID_STATUSES = {
    STATUS_ACTIVE,
    STATUS_DISABLED,
}


# ============================================================
# Helpers
# ============================================================

def normalize_email(email: str) -> str:
    """
    Normalize an email address before storing/querying it.

    Lowercase normalization prevents:
        User@example.com
        user@example.com

    from being treated as two different accounts.
    """

    return email.strip().lower()


# ============================================================
# Create User
# ============================================================

def create_user(
    name: str,
    email: str,
    password_hash: str,
    role: str = ROLE_USER,
):
    """
    Create a new user.

    Password hashing must happen before calling this function.
    Plain-text passwords must NEVER be stored in MongoDB.
    """

    if role not in VALID_ROLES:
        raise ValueError(
            f"Invalid user role: {role}"
        )

    name = name.strip()
    email = normalize_email(email)

    if not name:
        raise ValueError(
            "User name cannot be empty."
        )

    if not email:
        raise ValueError(
            "User email cannot be empty."
        )

    if not password_hash:
        raise ValueError(
            "Password hash cannot be empty."
        )

    now = datetime.now(timezone.utc)

    user_document = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "status": STATUS_ACTIVE,
        "created_at": now,
        "updated_at": now,
    }

    try:

        result = users_collection.insert_one(
            user_document
        )

    except DuplicateKeyError:

        return None

    user_document["_id"] = result.inserted_id

    return user_document


# ============================================================
# Find User
# ============================================================

def get_user_by_email(email: str):
    """
    Find a user by normalized email address.
    """

    normalized_email = normalize_email(email)

    return users_collection.find_one(
        {
            "email": normalized_email
        }
    )


def get_user_by_id(user_id):
    """
    Find a user by MongoDB ObjectId.
    """

    return users_collection.find_one(
        {
            "_id": user_id
        }
    )


# ============================================================
# Update User
# ============================================================

def update_user_status(
    user_id,
    status: str,
):
    """
    Enable or disable a user account.
    """

    if status not in VALID_STATUSES:
        raise ValueError(
            f"Invalid user status: {status}"
        )

    result = users_collection.update_one(
        {
            "_id": user_id
        },
        {
            "$set": {
                "status": status,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    return result.modified_count > 0