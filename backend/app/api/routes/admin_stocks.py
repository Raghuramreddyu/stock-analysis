from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_admin

from app.models.admin_stock_post import (
    create_admin_stock_post,
    publish_multiple_stocks
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ============================================================
# Publish One Stock
# ============================================================

@router.post("/stocks/publish")
def publish_stock(
    stock: dict,
    admin=Depends(require_admin)
):
    required_fields = [
        "ticker",
        "trading_date"
    ]

    for field in required_fields:
        if field not in stock:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required field: {field}"
            )

    try:
        post_id = create_admin_stock_post(
            stock_data=stock,
            admin_user=admin
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    return {
        "message": "Stock published successfully",
        "post_id": post_id,
        "ticker": stock["ticker"].upper(),
        "trading_date": stock["trading_date"]
    }


# ============================================================
# Publish Multiple Stocks
# ============================================================

@router.post("/stocks/publish-all")
def publish_all_stocks(
    stocks: list[dict],
    admin=Depends(require_admin)
):
    if not stocks:
        raise HTTPException(
            status_code=400,
            detail="No stocks provided"
        )

    result = publish_multiple_stocks(
        stocks=stocks,
        admin_user=admin
    )

    return {
        "message": "Bulk publish completed",
        "published_count": len(
            result["published"]
        ),
        "duplicate_count": len(
            result["duplicates"]
        ),
        "failed_count": len(
            result["failed"]
        ),
        "published": result["published"],
        "duplicates": result["duplicates"],
        "failed": result["failed"]
    }