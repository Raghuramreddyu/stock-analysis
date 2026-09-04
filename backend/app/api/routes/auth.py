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

    token = create_access_token({
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"]
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }