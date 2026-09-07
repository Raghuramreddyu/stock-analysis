from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_user
from app.models.admin_stock_post import (
    get_published_stocks,
    get_published_reports,
)


router = APIRouter(
    prefix="/user",
    tags=["User"]
)


# ============================================================
# Published Stocks
# ============================================================

@router.get("/stocks")
def get_user_stocks(
    trading_date: str | None = None,
    user=Depends(require_user),
):
    try:

        stocks = get_published_stocks(
            trading_date=trading_date
        )

        return {
            "count": len(stocks),
            "stocks": stocks,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )


# ============================================================
# Published Reports
# ============================================================

@router.get("/reports")
def get_user_reports(
    stock_id: str | None = None,
    user=Depends(require_user),
):

    try:

        reports = get_published_reports(
            stock_id=stock_id
        )

        return {
            "count": len(reports),
            "reports": reports,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )


# ============================================================
# Published Reports for Specific Stock
# ============================================================

@router.get(
    "/stocks/{stock_id}/reports"
)
def get_stock_reports(
    stock_id: str,
    user=Depends(require_user),
):

    try:

        reports = get_published_reports(
            stock_id=stock_id
        )

        return {
            "stock_id": stock_id,
            "count": len(reports),
            "reports": reports,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )