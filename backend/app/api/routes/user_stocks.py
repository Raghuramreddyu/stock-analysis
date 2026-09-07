from fastapi import APIRouter, Depends

from app.core.auth import require_user
from app.models.admin_stock_post import get_published_stocks


router = APIRouter(
    prefix="/user",
    tags=["User"]
)


@router.get("/stocks")
def get_user_stocks(
    trading_date: str = None,
    user=Depends(require_user)
):
    stocks = get_published_stocks(
        trading_date=trading_date
    )

    return {
        "count": len(stocks),
        "stocks": stocks
    }