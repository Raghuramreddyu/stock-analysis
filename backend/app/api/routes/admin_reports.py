from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.core.auth import require_admin

from app.services.report_service import (
    generate_stock_report,
    get_admin_reports,
)

from app.models.admin_stock_post import (
    publish_stock_report,
    unpublish_stock_report,
)


router = APIRouter(
    prefix="/admin/reports",
    tags=["Admin Reports"],
)


# ============================================================
# Generate Report
# ============================================================

@router.post("/generate/{ticker}")
def generate_report(
    ticker: str,
    admin=Depends(require_admin),
):
    """
    Generate a stock analysis report.

    The generated report is saved as draft.
    """

    try:

        report = generate_stock_report(
            ticker=ticker,
            admin_user=admin,
        )

        return {
            "message": (
                "Stock report generated successfully"
            ),
            **report,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {exc}",
        )


# ============================================================
# Get Admin Reports
# ============================================================

@router.get("")
def get_reports(
    ticker: str | None = None,
    status: str | None = None,
    admin=Depends(require_admin),
):
    """
    Get reports for the admin dashboard.

    Optional filters:

        ?ticker=AAPL
        ?status=draft
        ?status=published
    """

    try:

        reports = get_admin_reports(
            ticker=ticker,
            status=status,
        )

        return {
            "count": len(reports),
            "reports": reports,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch reports: {exc}",
        )


# ============================================================
# Publish Report
# ============================================================

@router.post("/{report_id}/publish")
def publish_report(
    report_id: str,
    stock_id: str,
    admin=Depends(require_admin),
):
    """
    Publish a draft stock report.
    """

    try:

        result = publish_stock_report(
            stock_id=stock_id,
            report_id=report_id,
            admin_user=admin,
        )

        return {
            "message": (
                "Stock report published successfully"
            ),
            **result,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to publish report: {exc}",
        )


# ============================================================
# Unpublish Report
# ============================================================

@router.post("/{report_id}/unpublish")
def unpublish_report(
    report_id: str,
    admin=Depends(require_admin),
):
    """
    Move a published report back to draft.
    """

    try:

        result = unpublish_stock_report(
            report_id=report_id,
            admin_user=admin,
        )

        return {
            "message": (
                "Stock report unpublished successfully"
            ),
            **result,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to unpublish report: {exc}",
        )