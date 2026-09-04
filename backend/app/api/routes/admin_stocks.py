from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_admin
from app.models.admin_stock_post import create_admin_stock_post


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.post("/stocks/publish")
def publish_stock(
    stock: dict,
    admin=Depends(require_admin)
):

    required_fields = [
        "ticker",
        "price",
        "change"
    ]

    for field in required_fields:
        if field not in stock:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required field: {field}"
            )

    stock_id = create_admin_stock_post(
        stock_data=stock,
        admin_user=admin
    )

    return {
        "message": "Stock published successfully",
        "stock_id": stock_id,
        "ticker": stock["ticker"]
    }