from datetime import datetime, timezone

from bson import ObjectId

from app.models.stock import get_stock_by_ticker
from app.models.stock_quote import upsert_stock_quote
from app.models.stock_quote_history import record_stock_quote


# ============================================================
# Helpers
# ============================================================

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================
# Market Data Ingestion
# ============================================================

def ingest_market_quote(
    ticker: str,
    price: float,
    change: float | None = None,
    change_percent: float | None = None,
    volume: int | None = None,
    volume_change_percent: float | None = None,
    open_price: float | None = None,
    high_price: float | None = None,
    low_price: float | None = None,
    previous_close: float | None = None,
    market_timestamp: datetime | None = None,
    source: str = "unknown",
    save_history: bool = True,
):
    """
    Central entry point for market quote ingestion.

    Supported sources include:

        - Finnhub
        - Screenshot/OCR
        - Other future market-data providers

    Responsibilities:

        1. Normalize ticker
        2. Resolve ticker -> stock_id
        3. Validate market data
        4. Update current quote
        5. Optionally record historical observation

    Database collections are accessed indirectly through
    the model layer.
    """

    # --------------------------------------------------------
    # Validate ticker
    # --------------------------------------------------------

    if not ticker or not ticker.strip():
        raise ValueError(
            "Ticker cannot be empty."
        )

    ticker = ticker.strip().upper()


    # --------------------------------------------------------
    # Validate price
    # --------------------------------------------------------

    if price < 0:
        raise ValueError(
            "Price cannot be negative."
        )


    # --------------------------------------------------------
    # Resolve stock
    # --------------------------------------------------------

    stock = get_stock_by_ticker(ticker)

    if not stock:
        raise ValueError(
            f"Stock '{ticker}' does not exist."
        )

    stock_id = stock["_id"]


    # --------------------------------------------------------
    # Resolve timestamp
    # --------------------------------------------------------

    if market_timestamp is None:
        market_timestamp = _utc_now()

    if market_timestamp.tzinfo is None:
        market_timestamp = market_timestamp.replace(
            tzinfo=timezone.utc
        )


    # --------------------------------------------------------
    # Update current quote
    # --------------------------------------------------------

    current_quote_result = upsert_stock_quote(
        stock_id=stock_id,
        price=price,
        change=change,
        change_percent=change_percent,
        volume=volume,
        volume_change_percent=volume_change_percent,
        open_price=open_price,
        high_price=high_price,
        low_price=low_price,
        previous_close=previous_close,
        market_timestamp=market_timestamp,
        source=source,
    )


    # --------------------------------------------------------
    # Record historical observation
    # --------------------------------------------------------

    history_record = None

    if save_history:

        history_record = record_stock_quote(
            stock_id=stock_id,
            price=price,
            market_timestamp=market_timestamp,
            change=change,
            change_percent=change_percent,
            volume=volume,
            open_price=open_price,
            high_price=high_price,
            low_price=low_price,
            previous_close=previous_close,
            source=source,
        )


    # --------------------------------------------------------
    # Return ingestion result
    # --------------------------------------------------------

    return {
        "ticker": ticker,
        "stock_id": stock_id,
        "source": source,
        "market_timestamp": market_timestamp,
        "current_quote": current_quote_result,
        "history_recorded": history_record is not None,
    }