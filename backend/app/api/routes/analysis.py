from fastapi import APIRouter, Depends

from app.core.auth import require_user
from app.services.finnhub_service import get_stock_analysis


router = APIRouter(
    prefix="/stocks",
    tags=["Analysis"]
)


@router.get("/{ticker}/analysis")
def get_analysis(
    ticker: str,
    current_user=Depends(require_user)
):
    """
    Get comprehensive stock analysis including technical indicators,
    news sentiment, and recommendation.
    Requires authentication.
    """
    analysis = get_stock_analysis(ticker)

    return analysis
