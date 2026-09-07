from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_admin
from app.models.admin_stock_post import (
    publish_stock_report,
    unpublish_stock_report,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ============================================================
# Publish Stock Report
# ============================================================

@router.post("/reports/{report_id}/publish")
def publish_report(
    report_id: str,
    stock_id: str,
    admin=Depends(require_admin),
):
    """
    Publish an existing stock report.

    Admin only.

    The stock itself is NOT duplicated or published.
    Only the report status is changed to 'published'.
    """

    try:

        result = publish_stock_report(
            stock_id=stock_id,
            report_id=report_id,
            admin_user=admin,
        )

        return {
            "message": "Stock report published successfully",
            **result,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


# ============================================================
# Unpublish Stock Report
# ============================================================

@router.post("/reports/{report_id}/unpublish")
def unpublish_report(
    report_id: str,
    admin=Depends(require_admin),
):
    """
    Move a published report back to draft.

    Admin only.
    """

    try:

        result = unpublish_stock_report(
            report_id=report_id,
            admin_user=admin,
        )

        return {
            "message": "Stock report unpublished successfully",
            **result,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )