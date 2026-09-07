from fastapi import APIRouter, HTTPException

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest
)

from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# Register
# ============================================================

@router.post("/register")
def register(request: RegisterRequest):

    user = register_user(
        name=request.name,
        email=request.email,
        password=request.password,
        role="user"
    )

    if user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return {
        "message": "User registered successfully",
        "user": user
    }


# ============================================================
# Login
# ============================================================

@router.post("/login")
def login(request: LoginRequest):

    user = authenticate_user(
        email=request.email,
        password=request.password
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Use numeric application-level user_id
    # instead of MongoDB's internal _id.
    token = create_access_token({
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"]
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }