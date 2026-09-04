from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

import os
import shutil
import cv2

from datetime import date

from pymongo.errors import DuplicateKeyError

from app.services.image_service import preprocess_image
from app.services.ocr_service import extract_text
from app.services.parser_service import parse_stock_data

from app.core.auth import require_admin

from app.models.stock import (
    save_stock_snapshot,
    save_upload_metadata,
    get_stock_snapshot
)


router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


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


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    admin=Depends(require_admin)
):

    # -----------------------------
    # 0. Validate file type
    # -----------------------------

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

    # -----------------------------
    # 1. Save original image
    # -----------------------------

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # -----------------------------
    # 2. Preprocess image
    # -----------------------------

    processed_image = preprocess_image(file_path)

    processed_filename = f"processed_{file.filename}"

    processed_path = os.path.join(
        UPLOAD_DIR,
        processed_filename
    )

    cv2.imwrite(
        processed_path,
        processed_image
    )

    # -----------------------------
    # 3. OCR
    # -----------------------------

    extracted_text = extract_text(file_path)

    print("========== OCR OUTPUT ==========")
    print(extracted_text)
    print("================================")

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the image"
        )

    # -----------------------------
    # 4. Parse stock data
    # -----------------------------

    parsed_stocks = parse_stock_data(extracted_text)

    print("========== PARSED STOCKS ==========")
    print(parsed_stocks)
    print("====================================")

    if not parsed_stocks:
        raise HTTPException(
            status_code=400,
            detail="No valid stock data found in the image"
        )

    # -----------------------------
    # 5. Trading date
    # -----------------------------

    trading_date = date.today().isoformat()

    # -----------------------------
    # 6. Save upload metadata
    # -----------------------------

    upload_id = save_upload_metadata(
        filename=file.filename,
        processed_filename=processed_filename,
        trading_date=trading_date,
        stock_count=len(parsed_stocks)
    )

    # -----------------------------
    # 7. Save stocks to MongoDB
    # -----------------------------

    saved_stocks = []

    duplicates = []

    new_records = 0

    for stock in parsed_stocks:

        stock["trading_date"] = trading_date

        # Connect stock to upload
        stock["upload_id"] = upload_id

        try:

            stock_id = save_stock_snapshot(stock)

            new_records += 1

            formatted_stock = format_stock(stock)

            formatted_stock["id"] = stock_id

            saved_stocks.append(
                formatted_stock
            )

        except DuplicateKeyError:
            duplicates.append(
                stock["ticker"]
            )

            formatted_stock = format_stock(
                stock
            )

            saved_stocks.append(
                formatted_stock
            )
    



    # -----------------------------
    # 8. Return response
    # -----------------------------

    return {
        "message": "Image processed successfully",
        "upload_id": upload_id,
        "filename": file.filename,
        "processed_image": processed_filename,
        "ocr_text": extracted_text,
        "stocks": saved_stocks,
        "detected": len(parsed_stocks),
        "new_records": new_records,
        "duplicates": len(duplicates)
    }