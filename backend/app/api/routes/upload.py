import os
import tempfile
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.core.auth import require_admin

from app.services.image_service import preprocess_image
from app.services.ocr_service import extract_text
from app.services.parser_service import parse_stock_data
from app.services.market_data_service import (
    ingest_market_quote,
)


router = APIRouter()


# ============================================================
# Response Formatting
# ============================================================

def format_stock(stock):
    """
    Convert parsed/ingested stock data into a consistent
    response format for the frontend.
    """

    return {
        "ticker": stock["ticker"],
        "price": stock["price"],
        "change": stock.get("change"),
        "change_percent": stock.get(
            "change_percent"
        ),
        "volume_change_percent": stock.get(
            "volume_change_percent"
        ),
    }


# ============================================================
# Upload Endpoint
# ============================================================

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    admin=Depends(require_admin),
):
    """
    Process a stock-market screenshot.

    Flow:

        Screenshot
            ↓
        Temporary file
            ↓
        Image preprocessing
            ↓
        OCR
            ↓
        Parser
            ↓
        Market-data service
            ↓
        MongoDB

    Uploaded images are NOT permanently stored.
    The temporary file is deleted after processing.
    """

    # --------------------------------------------------------
    # 1. Validate file type
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/jpg",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG and PNG images are allowed."
            ),
        )


    # --------------------------------------------------------
    # 2. Create temporary image file
    # --------------------------------------------------------

    temp_file_path = None

    try:

        file_extension = os.path.splitext(
            file.filename or ""
        )[1]

        if not file_extension:
            file_extension = ".jpg"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=file_extension,
        ) as temp_file:

            temp_file_path = temp_file.name

            contents = await file.read()

            if not contents:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded image is empty.",
                )

            temp_file.write(contents)


        # ----------------------------------------------------
        # 3. Preprocess image
        # ----------------------------------------------------

        processed_image = preprocess_image(
            temp_file_path
        )


        # ----------------------------------------------------
        # 4. OCR
        # ----------------------------------------------------

        extracted_text = extract_text(
            processed_image
        )

        print(
            "========== OCR OUTPUT =========="
        )
        print(extracted_text)
        print(
            "================================"
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract text "
                    "from the image."
                ),
            )


        # ----------------------------------------------------
        # 5. Parse stock data
        # ----------------------------------------------------

        parsed_stocks = parse_stock_data(
            extracted_text
        )

        print(
            "========== PARSED STOCKS =========="
        )
        print(parsed_stocks)
        print(
            "===================================="
        )

        if not parsed_stocks:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No valid stock data found "
                    "in the image."
                ),
            )


        # ----------------------------------------------------
        # 6. Ingest market data
        # ----------------------------------------------------

        saved_stocks = []

        failed_stocks = []

        # A screenshot does not necessarily contain the exact
        # market timestamp, so this represents the time the
        # backend processed the observation.
        ingestion_timestamp = datetime.now(
            timezone.utc
        )

        for stock in parsed_stocks:

            try:

                result = ingest_market_quote(
                    ticker=stock["ticker"],
                    price=stock["price"],
                    change=stock.get(
                        "change"
                    ),
                    change_percent=stock.get(
                        "change_percent"
                    ),
                    volume_change_percent=stock.get(
                        "volume_change_percent"
                    ),
                    market_timestamp=(
                        ingestion_timestamp
                    ),
                    source="screenshot",
                    save_history=True,
                )

                formatted_stock = format_stock(
                    stock
                )

                formatted_stock["stock_id"] = str(
                    result["stock_id"]
                )

                formatted_stock[
                    "history_recorded"
                ] = result["history_recorded"]

                saved_stocks.append(
                    formatted_stock
                )

            except ValueError as exc:

                failed_stocks.append(
                    {
                        "ticker": stock.get(
                            "ticker"
                        ),
                        "error": str(exc),
                    }
                )


        # ----------------------------------------------------
        # 7. Handle ingestion result
        # ----------------------------------------------------

        if not saved_stocks:

            raise HTTPException(
                status_code=400,
                detail={
                    "message": (
                        "No stock data could "
                        "be saved."
                    ),
                    "failed_stocks": failed_stocks,
                },
            )


        # ----------------------------------------------------
        # 8. Return response
        # ----------------------------------------------------

        return {
            "message": (
                "Image processed successfully"
            ),

            # We return the original filename for UI feedback,
            # but we DO NOT save the uploaded image.
            "filename": file.filename,

            "ocr_text": extracted_text,

            "stocks": saved_stocks,

            "detected": len(parsed_stocks),

            "saved": len(saved_stocks),

            "failed": len(failed_stocks),

            "failed_stocks": failed_stocks,

            "source": "screenshot",

            "processed_at": ingestion_timestamp,
        }


    finally:

        # ----------------------------------------------------
        # 9. Delete temporary image
        # ----------------------------------------------------

        if (
            temp_file_path
            and os.path.exists(temp_file_path)
        ):
            try:
                os.remove(temp_file_path)

            except OSError as exc:
                print(
                    "Warning: could not delete "
                    f"temporary file: {exc}"
                )