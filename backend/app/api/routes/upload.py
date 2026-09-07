from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

import os
import tempfile

from datetime import date

from pymongo.errors import DuplicateKeyError

from app.services.image_service import preprocess_image
from app.services.ocr_service import extract_text
from app.services.parser_service import parse_stock_data

from app.core.auth import require_admin

from app.models.stock import save_stock_data


router = APIRouter()


# ============================================================
# Format Stock
# ============================================================

def format_stock(stock):
    """
    Convert stock data into one consistent format
    for the frontend.
    """

    return {
        "ticker": stock["ticker"],
        "price": stock["price"],
        "change": stock["change"],
        "change_percent": stock.get(
            "change_percent",
            stock.get("changePercent")
        ),
        "volume_change_percent": stock.get(
            "volume_change_percent",
            stock.get("volumeChangePercent")
        ),
        "trading_date": stock.get(
            "trading_date",
            stock.get("tradingDate")
        )
    }


# ============================================================
# Upload Stock Image
# ============================================================

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    admin=Depends(require_admin)
):

    # --------------------------------------------------------
    # 0. Validate file type
    # --------------------------------------------------------

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG and PNG images are allowed"
        )


    # --------------------------------------------------------
    # 1. Create temporary image file
    # --------------------------------------------------------

    temp_file_path = None

    try:

        file_extension = os.path.splitext(
            file.filename
        )[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=file_extension
        ) as temp_file:

            temp_file_path = temp_file.name

            contents = await file.read()

            temp_file.write(contents)


        # ----------------------------------------------------
        # 2. Preprocess image
        # ----------------------------------------------------

        processed_image = preprocess_image(
            temp_file_path
        )


        # ----------------------------------------------------
        # 3. OCR
        # ----------------------------------------------------

        extracted_text = extract_text(
            temp_file_path
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
                detail="Could not extract text from the image"
            )


        # ----------------------------------------------------
        # 4. Parse stock data
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
                detail="No valid stock data found in the image"
            )


        # ----------------------------------------------------
        # 5. Trading date
        # ----------------------------------------------------

        trading_date = date.today().isoformat()


        # ----------------------------------------------------
        # 6. Save stocks to MongoDB
        # ----------------------------------------------------

        saved_stocks = []

        duplicates = []

        new_records = 0


        for stock in parsed_stocks:

            stock["trading_date"] = trading_date

            try:

                result = save_stock_data(
                    stock
                )

                new_records += 1


                formatted_stock = format_stock(
                    stock
                )


                # Numeric application IDs
                formatted_stock["stock_id"] = (
                    result["stock_id"]
                )

                formatted_stock["market_data_id"] = (
                    result["market_data_id"]
                )


                saved_stocks.append(
                    formatted_stock
                )


            except DuplicateKeyError:

                duplicates.append(
                    stock["ticker"]
                )


                # The market-data record already exists.
                # Return the stock information to the frontend.
                formatted_stock = format_stock(
                    stock
                )

                saved_stocks.append(
                    formatted_stock
                )


        # ----------------------------------------------------
        # 7. Return response
        # ----------------------------------------------------

        return {
            "message": "Image processed successfully",
            "filename": file.filename,
            "ocr_text": extracted_text,
            "stocks": saved_stocks,
            "detected": len(parsed_stocks),
            "new_records": new_records,
            "duplicates": len(duplicates)
        }


    finally:

        # ----------------------------------------------------
        # 8. Delete temporary image
        # ----------------------------------------------------

        if (
            temp_file_path
            and os.path.exists(temp_file_path)
        ):

            os.remove(
                temp_file_path
            )