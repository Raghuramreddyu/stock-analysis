import os
from datetime import datetime, timedelta, timezone

import requests
from dotenv import load_dotenv
from fastapi import HTTPException

from app.database.mongodb import (
    stocks_collection,
    stock_quotes_collection,
    stock_quote_history_collection,
)


# ============================================================
# Environment
# ============================================================

load_dotenv()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")

BASE_URL = "https://finnhub.io/api/v1"

if not FINNHUB_API_KEY:
    print("WARNING: FINNHUB_API_KEY not found in .env file")


# ============================================================
# In-memory cache
# ============================================================

_cache = {}

CACHE_TTL = {
    "quote": 60,
    "profile": 86400,
    "technical": 900,
    "news": 3600,
    "analysis": 900,
}


def _get_cache_key(
    ticker: str,
    data_type: str,
) -> str:
    today = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    return (
        f"{ticker.upper()}_"
        f"{data_type}_"
        f"{today}"
    )


def _get_from_cache(
    ticker: str,
    data_type: str,
):
    key = _get_cache_key(
        ticker,
        data_type,
    )

    cached = _cache.get(key)

    if not cached:
        return None

    ttl = CACHE_TTL.get(
        data_type,
        300,
    )

    age = (
        datetime.now(timezone.utc)
        - cached["timestamp"]
    ).total_seconds()

    if age < ttl:
        return cached["data"]

    del _cache[key]

    return None


def _set_cache(
    ticker: str,
    data_type: str,
    data,
):
    key = _get_cache_key(
        ticker,
        data_type,
    )

    _cache[key] = {
        "data": data,
        "timestamp": datetime.now(
            timezone.utc
        ),
    }


def _clear_analysis_cache(
    ticker: str,
):
    """
    Clear calculated data after new
    market data is synchronized.
    """

    ticker = ticker.upper()

    keys_to_remove = [
        _get_cache_key(
            ticker,
            "quote",
        ),
        _get_cache_key(
            ticker,
            "technical",
        ),
        _get_cache_key(
            ticker,
            "news",
        ),
        _get_cache_key(
            ticker,
            "analysis",
        ),
    ]

    for key in keys_to_remove:
        _cache.pop(
            key,
            None,
        )


# ============================================================
# Utility
# ============================================================

def _ensure_utc(
    value: datetime,
) -> datetime:
    """
    Ensure datetime is timezone-aware UTC.
    """

    if value.tzinfo is None:
        return value.replace(
            tzinfo=timezone.utc
        )

    return value.astimezone(
        timezone.utc
    )


# ============================================================
# Finnhub HTTP Client
# ============================================================

def _call_finnhub(
    endpoint: str,
    params: dict,
):
    """
    Call Finnhub API.

    Converts common Finnhub/network failures
    into FastAPI HTTPExceptions.
    """

    if not FINNHUB_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "FINNHUB_API_KEY is missing "
                "from the backend .env file."
            ),
        )

    request_params = {
        **params,
        "token": FINNHUB_API_KEY,
    }

    url = f"{BASE_URL}/{endpoint}"

    try:
        response = requests.get(
            url,
            params=request_params,
            timeout=20,
        )

        # ----------------------------------------------------
        # Authentication
        # ----------------------------------------------------

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Finnhub API key is invalid "
                    "or unauthorized."
                ),
            )

        # ----------------------------------------------------
        # Forbidden
        # ----------------------------------------------------

        if response.status_code == 403:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Finnhub API access is forbidden "
                    "for this API key or endpoint."
                ),
            )

        # ----------------------------------------------------
        # Rate limit
        # ----------------------------------------------------

        if response.status_code == 429:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Finnhub rate limit reached. "
                    "Please try again later."
                ),
            )

        # ----------------------------------------------------
        # Other HTTP errors
        # ----------------------------------------------------

        response.raise_for_status()

        # ----------------------------------------------------
        # JSON response
        # ----------------------------------------------------

        try:
            data = response.json()

        except ValueError:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Finnhub returned an invalid "
                    "JSON response."
                ),
            )

        # ----------------------------------------------------
        # Finnhub application-level error
        # ----------------------------------------------------

        if (
            isinstance(data, dict)
            and data.get("error")
        ):
            raise HTTPException(
                status_code=502,
                detail=(
                    f"Finnhub API error: "
                    f"{data['error']}"
                ),
            )

        return data

    except HTTPException:
        raise

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail=(
                "Finnhub API request timed out."
            ),
        )

    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "Failed to reach Finnhub API: "
                f"{error}"
            ),
        )


# ============================================================
# Finnhub Quote
# ============================================================

def get_finnhub_quote(
    ticker: str,
) -> dict:
    """
    Get the current quote from Finnhub.

    Endpoint:

        /quote
    """

    ticker = ticker.strip().upper()

    if not ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required.",
        )

    cached = _get_from_cache(
        ticker,
        "quote",
    )

    if cached:
        return cached

    quote = _call_finnhub(
        "quote",
        {
            "symbol": ticker,
        },
    )

    if not isinstance(
        quote,
        dict,
    ):
        raise HTTPException(
            status_code=502,
            detail=(
                f"Unexpected Finnhub quote "
                f"response for {ticker}."
            ),
        )

    current_price = quote.get("c")

    if current_price is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Finnhub returned no current "
                f"price for {ticker}."
            ),
        )

    try:
        price = float(current_price)

    except (
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=502,
            detail=(
                f"Invalid price returned "
                f"by Finnhub for {ticker}."
            ),
        )

    timestamp = quote.get("t")

    if timestamp:
        try:
            market_timestamp = datetime.fromtimestamp(
                int(timestamp),
                tz=timezone.utc,
            )

        except (
            TypeError,
            ValueError,
            OSError,
        ):
            market_timestamp = datetime.now(
                timezone.utc
            )

    else:
        market_timestamp = datetime.now(
            timezone.utc
        )

    result = {
        "price": price,
        "change": float(
            quote.get("d") or 0
        ),
        "change_percent": float(
            quote.get("dp") or 0
        ),
        "high": float(
            quote.get("h") or 0
        ),
        "low": float(
            quote.get("l") or 0
        ),
        "open": float(
            quote.get("o") or 0
        ),
        "previous_close": float(
            quote.get("pc") or 0
        ),
        "volume": None,
        "volume_change_percent": None,
        "market_timestamp": market_timestamp,
        "source": "finnhub",
    }

    _set_cache(
        ticker,
        "quote",
        result,
    )

    return result


# ============================================================
# Finnhub Company Profile
# ============================================================

def get_finnhub_company_profile(
    ticker: str,
) -> dict:
    """
    Get company information from Finnhub.

    Endpoint:

        /stock/profile2
    """

    ticker = ticker.strip().upper()

    if not ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required.",
        )

    cached = _get_from_cache(
        ticker,
        "profile",
    )

    if cached:
        return cached

    profile = _call_finnhub(
        "stock/profile2",
        {
            "symbol": ticker,
        },
    )

    if (
        not isinstance(
            profile,
            dict,
        )
        or not profile
    ):
        raise HTTPException(
            status_code=404,
            detail=(
                f"No company profile found "
                f"for ticker {ticker}."
            ),
        )

    industry = profile.get(
        "finnhubIndustry"
    )

    result = {
        "ticker": ticker,
        "company_name": profile.get(
            "name",
            ticker,
        ),
        "exchange": profile.get(
            "exchange"
        ),
        "currency": profile.get(
            "currency"
        ),
        "security_type": profile.get(
            "type",
            "EQUITY",
        ),
        "sector": industry,
        "industry": industry,
    }

    _set_cache(
        ticker,
        "profile",
        result,
    )

    return result


# ============================================================
# Save / Update Master Stock
# ============================================================

def upsert_stock(
    ticker: str,
) -> dict:
    """
    Create or update the master stock document.
    """

    ticker = ticker.strip().upper()

    profile = get_finnhub_company_profile(
        ticker
    )

    now = datetime.now(
        timezone.utc
    )

    document = {
        "ticker": ticker,
        "company_name": profile.get(
            "company_name"
        ),
        "exchange": profile.get(
            "exchange"
        ),
        "currency": profile.get(
            "currency"
        ),
        "security_type": profile.get(
            "security_type",
            "EQUITY",
        ),
        "sector": profile.get(
            "sector"
        ),
        "industry": profile.get(
            "industry"
        ),
        "status": "active",
        "updated_at": now,
    }

    stocks_collection.update_one(
        {
            "ticker": ticker,
        },
        {
            "$set": document,
            "$setOnInsert": {
                "created_at": now,
            },
        },
        upsert=True,
    )

    stock = stocks_collection.find_one(
        {
            "ticker": ticker,
        }
    )

    if not stock:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to create or retrieve "
                f"stock {ticker}."
            ),
        )

    return stock


# ============================================================
# Save Current Quote
# ============================================================

def upsert_stock_quote(
    stock_id,
    quote: dict,
) -> dict:
    """
    Update the current quote for a stock.

    Only one current quote exists per stock.
    """

    now = datetime.now(
        timezone.utc
    )

    market_timestamp = quote.get(
        "market_timestamp"
    )

    if isinstance(
        market_timestamp,
        datetime,
    ):
        market_timestamp = _ensure_utc(
            market_timestamp
        )

    else:
        market_timestamp = now

    document = {
        "stock_id": stock_id,
        "price": quote.get(
            "price"
        ),
        "change": quote.get(
            "change"
        ),
        "change_percent": quote.get(
            "change_percent"
        ),
        "volume": quote.get(
            "volume"
        ),
        "volume_change_percent": quote.get(
            "volume_change_percent"
        ),
        "open": quote.get(
            "open"
        ),
        "high": quote.get(
            "high"
        ),
        "low": quote.get(
            "low"
        ),
        "previous_close": quote.get(
            "previous_close"
        ),
        "market_timestamp": market_timestamp,
        "updated_at": now,
        "source": "finnhub",
    }

    stock_quotes_collection.update_one(
        {
            "stock_id": stock_id,
        },
        {
            "$set": document,
        },
        upsert=True,
    )

    current_quote = (
        stock_quotes_collection.find_one(
            {
                "stock_id": stock_id,
            }
        )
    )

    if not current_quote:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save current "
                "stock quote."
            ),
        )

    return current_quote


# ============================================================
# Save Historical Quote
# ============================================================

def insert_stock_quote_history(
    stock_id,
    quote: dict,
) -> str:
    """
    Insert one historical quote observation.

    Duplicate observations are prevented by checking:

        stock_id + market_timestamp
    """

    now = datetime.now(
        timezone.utc
    )

    market_timestamp = quote.get(
        "market_timestamp"
    )

    if isinstance(
        market_timestamp,
        datetime,
    ):
        market_timestamp = _ensure_utc(
            market_timestamp
        )

    else:
        market_timestamp = now

    existing = (
        stock_quote_history_collection.find_one(
            {
                "stock_id": stock_id,
                "market_timestamp": (
                    market_timestamp
                ),
            },
            {
                "_id": 1,
            },
        )
    )

    if existing:
        return str(
            existing["_id"]
        )

    document = {
        "stock_id": stock_id,
        "market_timestamp": market_timestamp,
        "received_at": now,
        "price": quote.get(
            "price"
        ),
        "change": quote.get(
            "change"
        ),
        "change_percent": quote.get(
            "change_percent"
        ),
        "volume": quote.get(
            "volume"
        ),
        "volume_change_percent": quote.get(
            "volume_change_percent"
        ),
        "open": quote.get(
            "open"
        ),
        "high": quote.get(
            "high"
        ),
        "low": quote.get(
            "low"
        ),
        "previous_close": quote.get(
            "previous_close"
        ),
        "source": quote.get(
            "source",
            "finnhub",
        ),
    }

    result = (
        stock_quote_history_collection.insert_one(
            document
        )
    )

    return str(
        result.inserted_id
    )


# ============================================================
# Historical Daily Candles
# ============================================================

def get_finnhub_historical_candles(
    ticker: str,
    days: int = 365,
) -> list[dict]:
    """
    Get historical daily candles from Finnhub.

    Endpoint:

        /stock/candle

    Returns normalized daily candles.
    """

    ticker = ticker.strip().upper()

    if not ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required.",
        )

    if days < 1:
        days = 1

    if days > 3650:
        days = 3650

    end_datetime = datetime.now(
        timezone.utc
    )

    start_datetime = (
        end_datetime
        - timedelta(days=days)
    )

    candle_data = _call_finnhub(
        "stock/candle",
        {
            "symbol": ticker,
            "resolution": "D",
            "from": int(
                start_datetime.timestamp()
            ),
            "to": int(
                end_datetime.timestamp()
            ),
        },
    )

    if not isinstance(
        candle_data,
        dict,
    ):
        raise HTTPException(
            status_code=502,
            detail=(
                f"Unexpected historical "
                f"data response for {ticker}."
            ),
        )

    status = candle_data.get("s")

    if status == "no_data":
        raise HTTPException(
            status_code=404,
            detail=(
                f"No historical market data "
                f"available for {ticker}."
            ),
        )

    if status != "ok":
        raise HTTPException(
            status_code=502,
            detail=(
                f"Finnhub historical data "
                f"request failed for {ticker}."
            ),
        )

    timestamps = candle_data.get(
        "t",
        []
    )

    opens = candle_data.get(
        "o",
        []
    )

    highs = candle_data.get(
        "h",
        []
    )

    lows = candle_data.get(
        "l",
        []
    )

    closes = candle_data.get(
        "c",
        []
    )

    volumes = candle_data.get(
        "v",
        []
    )

    candles = []

    total = min(
        len(timestamps),
        len(opens),
        len(highs),
        len(lows),
        len(closes),
    )

    for index in range(total):

        try:
            market_timestamp = (
                datetime.fromtimestamp(
                    int(timestamps[index]),
                    tz=timezone.utc,
                )
            )

            open_price = float(
                opens[index]
            )

            high_price = float(
                highs[index]
            )

            low_price = float(
                lows[index]
            )

            close_price = float(
                closes[index]
            )

        except (
            TypeError,
            ValueError,
            OSError,
        ):
            continue

        volume = None

        if index < len(volumes):

            try:
                volume = float(
                    volumes[index]
                )

            except (
                TypeError,
                ValueError,
            ):
                volume = None

        candles.append(
            {
                "market_timestamp": (
                    market_timestamp
                ),
                "open": open_price,
                "high": high_price,
                "low": low_price,
                "price": close_price,
                "volume": volume,
                "change": None,
                "change_percent": None,
                "volume_change_percent": None,
                "previous_close": None,
                "source": "finnhub",
            }
        )

    if not candles:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No valid historical candles "
                f"available for {ticker}."
            ),
        )

    return candles


# ============================================================
# SAFE Historical Backfill
# ============================================================

def backfill_stock_history(
    stock_id,
    ticker: str,
    days: int = 365,
) -> dict:
    """
    Safely backfill historical daily candles.

    Important:

    Historical candle access may not be available
    for every Finnhub API key.

    Therefore this function catches failures from
    the historical candle endpoint and returns a
    structured result instead of breaking the
    complete stock synchronization.

    Existing observations are skipped.

    Example result:

        {
            "status": "success",
            "fetched": 250,
            "inserted": 250,
            "skipped": 0,
            "message": "Historical data backfilled."
        }

    If Finnhub returns 403:

        {
            "status": "unavailable",
            "fetched": 0,
            "inserted": 0,
            "skipped": 0,
            "message": "..."
        }
    """

    ticker = ticker.strip().upper()

    if not ticker:
        return {
            "status": "failed",
            "fetched": 0,
            "inserted": 0,
            "skipped": 0,
            "message": "Ticker is required.",
        }

    try:

        candles = get_finnhub_historical_candles(
            ticker,
            days=days,
        )

    except HTTPException as error:

        # ----------------------------------------------------
        # Finnhub historical endpoint forbidden
        # ----------------------------------------------------

        if error.status_code == 502:

            return {
                "status": "unavailable",
                "fetched": 0,
                "inserted": 0,
                "skipped": 0,
                "message": str(
                    error.detail
                ),
            }

        # ----------------------------------------------------
        # No historical data
        # ----------------------------------------------------

        if error.status_code == 404:

            return {
                "status": "unavailable",
                "fetched": 0,
                "inserted": 0,
                "skipped": 0,
                "message": str(
                    error.detail
                ),
            }

        # ----------------------------------------------------
        # Unexpected error
        # ----------------------------------------------------

        return {
            "status": "failed",
            "fetched": 0,
            "inserted": 0,
            "skipped": 0,
            "message": str(
                error.detail
            ),
        }

    except Exception as error:

        return {
            "status": "failed",
            "fetched": 0,
            "inserted": 0,
            "skipped": 0,
            "message": (
                "Historical backfill failed: "
                f"{error}"
            ),
        }

    inserted = 0
    skipped = 0

    for candle in candles:

        market_timestamp = candle.get(
            "market_timestamp"
        )

        if not isinstance(
            market_timestamp,
            datetime,
        ):
            skipped += 1
            continue

        market_timestamp = _ensure_utc(
            market_timestamp
        )

        # ----------------------------------------------------
        # Check existing candle
        # ----------------------------------------------------

        existing = (
            stock_quote_history_collection.find_one(
                {
                    "stock_id": stock_id,
                    "market_timestamp": (
                        market_timestamp
                    ),
                },
                {
                    "_id": 1,
                },
            )
        )

        if existing:
            skipped += 1
            continue

        # ----------------------------------------------------
        # Insert candle
        # ----------------------------------------------------

        document = {
            "stock_id": stock_id,
            "market_timestamp": market_timestamp,
            "received_at": datetime.now(
                timezone.utc
            ),
            "price": candle.get(
                "price"
            ),
            "change": candle.get(
                "change"
            ),
            "change_percent": candle.get(
                "change_percent"
            ),
            "volume": candle.get(
                "volume"
            ),
            "volume_change_percent": candle.get(
                "volume_change_percent"
            ),
            "open": candle.get(
                "open"
            ),
            "high": candle.get(
                "high"
            ),
            "low": candle.get(
                "low"
            ),
            "previous_close": candle.get(
                "previous_close"
            ),
            "source": "finnhub",
        }

        try:

            stock_quote_history_collection.insert_one(
                document
            )

            inserted += 1

        except Exception:
            # Another request may have inserted
            # the same candle concurrently.
            skipped += 1

    return {
        "status": "success",
        "fetched": len(candles),
        "inserted": inserted,
        "skipped": skipped,
        "message": (
            "Historical data backfilled successfully."
        ),
    }


# ============================================================
# Dedicated Historical Backfill
# ============================================================

def run_historical_backfill(
    ticker: str,
    days: int = 365,
) -> dict:
    """
    Run historical backfill for an existing stock.

    This is intended to be called by a dedicated
    API endpoint.

    The stock must already exist in MongoDB.
    """

    ticker = ticker.strip().upper()

    if not ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required.",
        )

    stock = stocks_collection.find_one(
        {
            "ticker": ticker,
            "status": "active",
        },
        {
            "_id": 1,
            "ticker": 1,
        },
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Stock '{ticker}' not found."
            ),
        )

    result = backfill_stock_history(
        stock_id=stock["_id"],
        ticker=ticker,
        days=days,
    )

    return {
        "ticker": ticker,
        "stock_id": str(
            stock["_id"]
        ),
        "days_requested": days,
        "historical_backfill": result,
    }


# ============================================================
# Full Finnhub -> MongoDB Synchronization
# ============================================================

def sync_stock_from_finnhub(
    ticker: str,
) -> dict:
    """
    Synchronize one stock from Finnhub.

    Pipeline:

        Finnhub
           |
           +--> stocks
           |
           +--> stock_quotes
           |
           +--> stock_quote_history
                    |
                    +--> historical daily candles

    Historical backfill is SAFE.

    If Finnhub does not allow historical candle
    access for the API key, the current quote
    synchronization still succeeds.
    """

    ticker = ticker.strip().upper()

    if not ticker:
        raise HTTPException(
            status_code=400,
            detail="Ticker is required.",
        )

    # --------------------------------------------------------
    # Clear old calculated analysis cache
    # --------------------------------------------------------

    _clear_analysis_cache(
        ticker
    )

    # --------------------------------------------------------
    # 1. Get / update company profile
    # --------------------------------------------------------

    stock = upsert_stock(
        ticker
    )

    stock_id = stock["_id"]

    # --------------------------------------------------------
    # 2. Get current quote
    # --------------------------------------------------------

    quote = get_finnhub_quote(
        ticker
    )

    # --------------------------------------------------------
    # 3. Save current quote
    # --------------------------------------------------------

    current_quote = upsert_stock_quote(
        stock_id=stock_id,
        quote=quote,
    )

    # --------------------------------------------------------
    # 4. Save current quote to history
    # --------------------------------------------------------

    current_history_id = (
        insert_stock_quote_history(
            stock_id=stock_id,
            quote=quote,
        )
    )

    # --------------------------------------------------------
    # 5. SAFE historical backfill
    # --------------------------------------------------------

    backfill_result = (
        backfill_stock_history(
            stock_id=stock_id,
            ticker=ticker,
            days=365,
        )
    )

    # --------------------------------------------------------
    # 6. Return synchronization result
    # --------------------------------------------------------

    return {
        "ticker": ticker,

        "stock_id": str(
            stock_id
        ),

        "quote": {
            "price": quote.get(
                "price"
            ),
            "change": quote.get(
                "change"
            ),
            "change_percent": quote.get(
                "change_percent"
            ),
            "market_timestamp": quote.get(
                "market_timestamp"
            ),
            "source": "finnhub",
        },

        "current_quote_id": (
            str(
                current_quote["_id"]
            )
            if current_quote
            else None
        ),

        "history_id": current_history_id,

        "historical_backfill": (
            backfill_result
        ),

        "source": "finnhub",
    }


# ============================================================
# Technical Indicators
# ============================================================

def _calculate_sma(
    values: list[float],
    period: int,
) -> float | None:
    """
    Calculate Simple Moving Average.
    """

    if len(values) < period:
        return None

    recent_values = values[-period:]

    return (
        sum(recent_values)
        / period
    )


def _calculate_rsi(
    values: list[float],
    period: int = 14,
) -> float | None:
    """
    Calculate RSI from closing prices.

    Requires at least period + 1 prices.
    """

    if len(values) <= period:
        return None

    changes = [
        values[index]
        - values[index - 1]
        for index in range(
            1,
            len(values),
        )
    ]

    recent_changes = changes[-period:]

    gains = [
        change
        for change in recent_changes
        if change > 0
    ]

    losses = [
        -change
        for change in recent_changes
        if change < 0
    ]

    average_gain = (
        sum(gains)
        / period
    )

    average_loss = (
        sum(losses)
        / period
    )

    if average_loss == 0:

        return (
            100.0
            if average_gain > 0
            else 50.0
        )

    relative_strength = (
        average_gain
        / average_loss
    )

    return (
        100
        - (
            100
            / (
                1
                + relative_strength
            )
        )
    )


# ============================================================
# MongoDB Historical Prices
# ============================================================

def _get_mongodb_prices(
    ticker: str,
) -> tuple[list[float], dict]:

    """
    Get historical closing prices from MongoDB.

    Prices are sorted chronologically.
    """

    ticker = ticker.strip().upper()

    stock = stocks_collection.find_one(
        {
            "ticker": ticker,
            "status": "active",
        },
        {
            "_id": 1,
        },
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Stock '{ticker}' not found."
            ),
        )

    stock_id = stock["_id"]

    history = list(
        stock_quote_history_collection.find(
            {
                "stock_id": stock_id,
            },
            {
                "_id": 0,
                "price": 1,
                "market_timestamp": 1,
            },
        ).sort(
            "market_timestamp",
            1,
        )
    )

    prices = []

    latest_record = {}

    for item in history:

        price = item.get(
            "price"
        )

        if price is None:
            continue

        try:
            numeric_price = float(
                price
            )

        except (
            TypeError,
            ValueError,
        ):
            continue

        if numeric_price <= 0:
            continue

        prices.append(
            numeric_price
        )

        latest_record = item

    return (
        prices,
        latest_record,
    )


# ============================================================
# Technical Analysis
# ============================================================

def get_technical_indicators(
    ticker: str,
) -> dict:
    """
    Calculate technical indicators using
    historical market data stored in MongoDB.

    Indicators:

        SMA 50
        SMA 200
        RSI 14
    """

    ticker = ticker.strip().upper()

    cached = _get_from_cache(
        ticker,
        "technical",
    )

    if cached:
        return cached

    prices, latest_record = (
        _get_mongodb_prices(
            ticker
        )
    )

    if not prices:

        raise HTTPException(
            status_code=404,
            detail=(
                f"No historical prices "
                f"available for {ticker}."
            ),
        )

    stock = stocks_collection.find_one(
        {
            "ticker": ticker,
            "status": "active",
        },
        {
            "_id": 1,
        },
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Stock '{ticker}' not found."
            ),
        )

    stock_id = stock["_id"]

    current_quote = (
        stock_quotes_collection.find_one(
            {
                "stock_id": stock_id,
            }
        )
    )

    sma_50 = _calculate_sma(
        prices,
        50,
    )

    sma_200 = _calculate_sma(
        prices,
        200,
    )

    rsi = _calculate_rsi(
        prices,
        period=14,
    )

    trend = "neutral"

    if (
        sma_50 is not None
        and sma_200 is not None
    ):

        if sma_50 > sma_200:
            trend = "bullish"

        elif sma_50 < sma_200:
            trend = "bearish"

    if rsi is not None:

        if rsi > 70:
            trend = "bearish"

        elif rsi < 30:
            trend = "bullish"

    if current_quote:

        last_close = float(
            current_quote.get(
                "price"
            )
            or prices[-1]
        )

        daily_change_percent = float(
            current_quote.get(
                "change_percent"
            )
            or 0
        )

    else:

        last_close = float(
            prices[-1]
        )

        daily_change_percent = 0.0

    result = {
        "trend": trend,
        "sma_50": sma_50,
        "sma_200": sma_200,
        "rsi": rsi,
        "last_close": last_close,
        "daily_change_percent": (
            daily_change_percent
        ),
        "historical_data_points": (
            len(prices)
        ),
    }

    _set_cache(
        ticker,
        "technical",
        result,
    )

    return result


# ============================================================
# Sentiment
# ============================================================

def _sentiment_label(
    score: float,
) -> str:

    if score > 0.1:
        return "Bullish"

    if score < -0.1:
        return "Bearish"

    return "Neutral"


def get_news_sentiment(
    ticker: str,
) -> dict:
    """
    Retrieve company news.

    Sentiment remains neutral because this
    implementation does not assume access to
    Finnhub's sentiment endpoint.
    """

    ticker = ticker.strip().upper()

    cached = _get_from_cache(
        ticker,
        "news",
    )

    if cached:
        return cached

    end_date = datetime.now(
        timezone.utc
    ).date()

    start_date = (
        end_date
        - timedelta(days=30)
    )

    news_data = _call_finnhub(
        "company-news",
        {
            "symbol": ticker,
            "from": start_date.isoformat(),
            "to": end_date.isoformat(),
        },
    )

    if not isinstance(
        news_data,
        list,
    ):
        news_data = []

    score = 0.0

    articles = []

    for item in news_data[:10]:

        if not isinstance(
            item,
            dict,
        ):
            continue

        timestamp = item.get(
            "datetime"
        )

        if timestamp:

            try:

                time_published = (
                    datetime.fromtimestamp(
                        int(timestamp),
                        tz=timezone.utc,
                    ).isoformat()
                )

            except (
                TypeError,
                ValueError,
                OSError,
            ):

                time_published = ""

        else:

            time_published = ""

        articles.append(
            {
                "title": item.get(
                    "headline",
                    "",
                ),
                "url": item.get(
                    "url",
                    "",
                ),
                "source": item.get(
                    "source",
                    "",
                ),
                "sentiment_label": (
                    _sentiment_label(
                        score
                    )
                ),
                "sentiment_score": score,
                "time_published": (
                    time_published
                ),
            }
        )

    result = {
        "overall_sentiment_label": (
            _sentiment_label(
                score
            )
        ),
        "overall_sentiment_score": score,
        "articles": articles,
    }

    _set_cache(
        ticker,
        "news",
        result,
    )

    return result


# ============================================================
# Complete Stock Analysis
# ============================================================

def get_stock_analysis(
    ticker: str,
) -> dict:
    """
    Complete technical + news analysis.

    Technical analysis comes from MongoDB.

    News comes from Finnhub company-news.
    """

    ticker = ticker.strip().upper()

    cached = _get_from_cache(
        ticker,
        "analysis",
    )

    if cached:
        return cached

    technical = (
        get_technical_indicators(
            ticker
        )
    )

    news = get_news_sentiment(
        ticker
    )

    # --------------------------------------------------------
    # Technical score
    # --------------------------------------------------------

    trend_score = 0

    if technical.get(
        "trend"
    ) == "bullish":

        trend_score += 1

    elif technical.get(
        "trend"
    ) == "bearish":

        trend_score -= 1

    # --------------------------------------------------------
    # RSI score
    # --------------------------------------------------------

    rsi = technical.get(
        "rsi"
    )

    if rsi is not None:

        if rsi < 30:
            trend_score += 1

        elif rsi > 70:
            trend_score -= 1

    # --------------------------------------------------------
    # News sentiment score
    # --------------------------------------------------------

    sentiment_score = news.get(
        "overall_sentiment_score",
        0,
    )

    if sentiment_score > 0.1:

        trend_score += 1

    elif sentiment_score < -0.1:

        trend_score -= 1

    # --------------------------------------------------------
    # Final recommendation
    # --------------------------------------------------------

    recommendation = (
        "Bullish"
        if trend_score >= 1
        else "Bearish"
        if trend_score <= -1
        else "Neutral"
    )

    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    result = {
        "ticker": ticker,
        **technical,
        **news,
        "recommendation": recommendation,
    }

    _set_cache(
        ticker,
        "analysis",
        result,
    )

    return result