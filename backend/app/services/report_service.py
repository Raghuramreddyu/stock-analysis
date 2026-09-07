from datetime import datetime, timezone

from bson import ObjectId

from app.database.mongodb import (
    stocks_collection,
    stock_quotes_collection,
    stock_quote_history_collection,
    stock_reports_collection,
)


# ============================================================
# Helpers
# ============================================================

def _get_admin_id(admin_user: dict):
    """
    Support both authentication formats:

        _id
        user_id
    """

    admin_id = admin_user.get(
        "_id",
        admin_user.get("user_id"),
    )

    if not admin_id:
        raise ValueError(
            "Invalid admin user"
        )

    if not ObjectId.is_valid(
        str(admin_id)
    ):
        raise ValueError(
            "Invalid admin user ID"
        )

    return ObjectId(
        str(admin_id)
    )


def _get_trading_date(quote: dict) -> str:
    """
    Determine trading date from the market timestamp.
    """

    market_timestamp = quote.get(
        "market_timestamp"
    )

    if isinstance(
        market_timestamp,
        datetime,
    ):

        if market_timestamp.tzinfo is None:

            market_timestamp = (
                market_timestamp.replace(
                    tzinfo=timezone.utc
                )
            )

        return (
            market_timestamp
            .astimezone(timezone.utc)
            .date()
            .isoformat()
        )

    return datetime.now(
        timezone.utc
    ).date().isoformat()


def _calculate_sma(
    prices: list[float],
    period: int,
):
    """
    Calculate simple moving average.
    """

    if len(prices) < period:
        return None

    recent_prices = prices[-period:]

    return (
        sum(recent_prices)
        / period
    )


def _calculate_rsi(
    prices: list[float],
    period: int = 14,
):
    """
    Calculate RSI from historical closing prices.
    """

    if len(prices) <= period:
        return None

    changes = [
        prices[index]
        - prices[index - 1]
        for index in range(
            1,
            len(prices),
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
        sum(gains) / period
    )

    average_loss = (
        sum(losses) / period
    )

    if average_loss == 0:

        if average_gain > 0:
            return 100.0

        return 50.0

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


def _determine_trend(
    sma_50,
    sma_200,
    rsi,
):
    """
    Determine technical trend.
    """

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

    return trend


# ============================================================
# Generate Stock Report
# ============================================================

def generate_stock_report(
    ticker: str,
    admin_user: dict,
):
    """
    Generate a stock analysis report using data already
    stored in MongoDB.

    External Finnhub analysis is intentionally NOT required.

    Data sources:

        stocks
        stock_quotes
        stock_quote_history

    The generated report is saved as:

        status = draft

    An admin must explicitly publish it afterwards.
    """

    ticker = ticker.strip().upper()

    if not ticker:
        raise ValueError(
            "Ticker is required"
        )

    admin_id = _get_admin_id(
        admin_user
    )

    # --------------------------------------------------------
    # Find stock
    # --------------------------------------------------------

    stock = stocks_collection.find_one(
        {
            "ticker": ticker,
            "status": "active",
        }
    )

    if not stock:

        raise ValueError(
            f"Stock '{ticker}' not found"
        )

    stock_id = stock["_id"]

    # --------------------------------------------------------
    # Get current quote
    # --------------------------------------------------------

    quote = stock_quotes_collection.find_one(
        {
            "stock_id": stock_id
        }
    )

    if not quote:

        raise ValueError(
            f"No current quote available for {ticker}"
        )

    # --------------------------------------------------------
    # Get historical prices
    # --------------------------------------------------------

    history_cursor = (
        stock_quote_history_collection.find(
            {
                "stock_id": stock_id
            },
            {
                "_id": 0,
                "price": 1,
                "market_timestamp": 1,
            },
        )
        .sort(
            "market_timestamp",
            1,
        )
    )

    history = list(
        history_cursor
    )

    prices = []

    for item in history:

        price = item.get(
            "price"
        )

        if price is None:
            continue

        try:
            prices.append(
                float(price)
            )
        except (
            TypeError,
            ValueError,
        ):
            continue

    # --------------------------------------------------------
    # Include current quote if history is empty
    # --------------------------------------------------------

    current_price = quote.get(
        "price"
    )

    if (
        not prices
        and current_price is not None
    ):

        prices.append(
            float(current_price)
        )

    # --------------------------------------------------------
    # Technical indicators
    # --------------------------------------------------------

    sma_50 = _calculate_sma(
        prices,
        50,
    )

    sma_200 = _calculate_sma(
        prices,
        200,
    )

    rsi = _calculate_rsi(
        prices
    )

    trend = _determine_trend(
        sma_50,
        sma_200,
        rsi,
    )

    # --------------------------------------------------------
    # Current market data
    # --------------------------------------------------------

    price = quote.get(
        "price"
    )

    change = quote.get(
        "change"
    )

    change_percent = quote.get(
        "change_percent"
    )

    volume = quote.get(
        "volume"
    )

    volume_change_percent = quote.get(
        "volume_change_percent"
    )

    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    recommendation = "Neutral"

    if trend == "bullish":
        recommendation = "Bullish"

    elif trend == "bearish":
        recommendation = "Bearish"

    # --------------------------------------------------------
    # Trading date
    # --------------------------------------------------------

    trading_date = _get_trading_date(
        quote
    )

    # --------------------------------------------------------
    # Company information
    # --------------------------------------------------------

    company_name = stock.get(
        "company_name",
        ticker,
    )

    sector = stock.get(
        "sector"
    )

    industry = stock.get(
        "industry"
    )

    exchange = stock.get(
        "exchange"
    )

    # --------------------------------------------------------
    # Report title
    # --------------------------------------------------------

    title = (
        f"{ticker} Stock Analysis"
    )

    # --------------------------------------------------------
    # Report summary
    # --------------------------------------------------------

    summary = (
        f"{company_name} is currently trading "
        f"at {price}. The stock is showing a "
        f"{trend} technical trend with an "
        f"{recommendation} overall assessment."
    )

    # --------------------------------------------------------
    # Detailed analysis
    # --------------------------------------------------------

    analysis_text = (
        f"Stock Analysis Report\n"
        f"=====================\n\n"

        f"Company: {company_name}\n"
        f"Ticker: {ticker}\n"
        f"Exchange: {exchange}\n"
        f"Sector: {sector}\n"
        f"Industry: {industry}\n\n"

        f"Market Data\n"
        f"-----------\n"
        f"Price: {price}\n"
        f"Daily Change: {change}\n"
        f"Daily Change Percent: "
        f"{change_percent}%\n"
        f"Volume: {volume}\n"
        f"Volume Change Percent: "
        f"{volume_change_percent}%\n\n"

        f"Technical Analysis\n"
        f"------------------\n"
        f"Trend: {trend}\n"
        f"SMA 50: {sma_50}\n"
        f"SMA 200: {sma_200}\n"
        f"RSI: {rsi}\n\n"

        f"Overall Assessment\n"
        f"------------------\n"
        f"Recommendation: "
        f"{recommendation}\n\n"

        f"Data Source\n"
        f"-----------\n"
        f"Market data stored in MongoDB "
        f"from the synchronized stock quote."
    )

    # --------------------------------------------------------
    # Create report
    # --------------------------------------------------------

    now = datetime.now(
        timezone.utc
    )

    report_document = {

        "stock_id": stock_id,

        "ticker": ticker,

        "title": title,

        "summary": summary,

        "analysis": analysis_text,

        "analysis_data": {

            "price": price,

            "change": change,

            "change_percent": change_percent,

            "volume": volume,

            "volume_change_percent": (
                volume_change_percent
            ),

            "trend": trend,

            "sma_50": sma_50,

            "sma_200": sma_200,

            "rsi": rsi,

            "recommendation": (
                recommendation
            ),

            "data_source": (
                quote.get(
                    "source"
                )
            ),
        },

        "trading_date": trading_date,

        "status": "draft",

        "created_by": admin_id,

        "created_at": now,

        "updated_at": now,
    }

    result = (
        stock_reports_collection.insert_one(
            report_document
        )
    )

    return {

        "report_id": str(
            result.inserted_id
        ),

        "stock_id": str(
            stock_id
        ),

        "ticker": ticker,

        "title": title,

        "summary": summary,

        "analysis": analysis_text,

        "trading_date": trading_date,

        "status": "draft",

        "recommendation": (
            recommendation
        ),

        "created_at": now,
    }


# ============================================================
# Get Admin Reports
# ============================================================

def get_admin_reports(
    ticker: str | None = None,
    status: str | None = None,
):
    """
    Return reports for the admin dashboard.

    Admins can see both draft and published reports.
    """

    query = {}

    if ticker:

        query["ticker"] = (
            ticker.strip().upper()
        )

    if status:

        allowed_statuses = {
            "draft",
            "published",
        }

        if status not in allowed_statuses:

            raise ValueError(
                "Invalid report status. "
                "Use 'draft' or 'published'."
            )

        query["status"] = status

    reports = list(
        stock_reports_collection.find(
            query
        ).sort(
            "created_at",
            -1,
        )
    )

    # --------------------------------------------------------
    # Serialize MongoDB values
    # --------------------------------------------------------

    for report in reports:

        if report.get("_id"):
            report["_id"] = str(
                report["_id"]
            )

        if report.get("stock_id"):
            report["stock_id"] = str(
                report["stock_id"]
            )

        if report.get("created_by"):
            report["created_by"] = str(
                report["created_by"]
            )

        if report.get("published_by"):
            report["published_by"] = str(
                report["published_by"]
            )

    return reports