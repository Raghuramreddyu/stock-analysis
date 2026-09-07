import os
from datetime import datetime, timedelta, timezone

import requests
import yfinance as yf
from dotenv import load_dotenv
from fastapi import HTTPException


load_dotenv()


FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
BASE_URL = "https://finnhub.io/api/v1"


if not FINNHUB_API_KEY:
    print("ERROR: FINNHUB_API_KEY not found in .env file")


_cache = {}


def _get_cache_key(ticker: str, data_type: str) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    return f"{ticker.upper()}_{data_type}_{today}"


def _get_from_cache(ticker: str, data_type: str) -> dict | None:
    key = _get_cache_key(ticker, data_type)
    cached = _cache.get(key)

    if cached and (datetime.now() - cached["timestamp"]).total_seconds() < 86400:
        return cached["data"]

    if cached:
        del _cache[key]

    return None


def _set_cache(ticker: str, data_type: str, data: dict):
    _cache[_get_cache_key(ticker, data_type)] = {
        "data": data,
        "timestamp": datetime.now()
    }


def _call_finnhub(endpoint: str, params: dict) -> dict:
    if not FINNHUB_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="FINNHUB_API_KEY is missing from the backend .env file."
        )

    request_params = {
        **params,
        "token": FINNHUB_API_KEY
    }

    try:
        response = requests.get(
            f"{BASE_URL}/{endpoint}",
            params=request_params,
            timeout=10
        )

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail="Finnhub API key is invalid."
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=502,
                detail="Finnhub rate limit reached, please try again later."
            )

        response.raise_for_status()
        data = response.json()

        if isinstance(data, dict) and data.get("error"):
            raise HTTPException(
                status_code=502,
                detail=f"Finnhub API error: {data['error']}"
            )

        return data

    except HTTPException:
        raise
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Finnhub API request timed out."
        )
    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to reach Finnhub API: {error}"
        )


def _calculate_sma(values: list[float], period: int) -> float | None:
    if len(values) < period:
        return None

    return sum(values[-period:]) / period


def _calculate_rsi(values: list[float], period: int = 14) -> float | None:
    if len(values) <= period:
        return None

    changes = [values[index] - values[index - 1] for index in range(1, len(values))]
    recent_changes = changes[-period:]
    gains = [change for change in recent_changes if change > 0]
    losses = [-change for change in recent_changes if change < 0]
    average_gain = sum(gains) / period
    average_loss = sum(losses) / period

    if average_loss == 0:
        return 100.0 if average_gain > 0 else 50.0

    relative_strength = average_gain / average_loss
    return 100 - (100 / (1 + relative_strength))


def get_technical_indicators(ticker: str) -> dict:
    cached = _get_from_cache(ticker, "technical")
    if cached:
        return cached

    ticker = ticker.upper()
    quote = _call_finnhub("quote", {"symbol": ticker})

    try:
        historical_data = yf.download(
            ticker,
            period="1y",
            interval="1d",
            auto_adjust=False,
            progress=False,
            threads=False
        )
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch historical data for {ticker}: {error}"
        )

    if historical_data.empty or "Close" not in historical_data:
        raise HTTPException(
            status_code=404,
            detail=f"No data available for ticker {ticker}"
        )

    close_data = historical_data["Close"]
    if hasattr(close_data, "columns"):
        close_data = close_data.iloc[:, 0]

    closes = [float(value) for value in close_data.dropna().tolist()]
    if not closes:
        raise HTTPException(
            status_code=404,
            detail=f"No data available for ticker {ticker}"
        )

    sma_50 = _calculate_sma(closes, 50)
    sma_200 = _calculate_sma(closes, 200)
    rsi = _calculate_rsi(closes)

    trend = "neutral"
    if sma_50 is not None and sma_200 is not None:
        trend = "bullish" if sma_50 > sma_200 else "bearish" if sma_50 < sma_200 else "neutral"

    if rsi is not None:
        if rsi > 70:
            trend = "bearish"
        elif rsi < 30:
            trend = "bullish"

    result = {
        "trend": trend,
        "sma_50": sma_50,
        "sma_200": sma_200,
        "rsi": rsi,
        "last_close": float(quote.get("c") or closes[-1]),
        "daily_change_percent": float(quote.get("dp") or 0)
    }

    _set_cache(ticker, "technical", result)
    return result


def _sentiment_label(score: float) -> str:
    if score > 0.1:
        return "Bullish"
    if score < -0.1:
        return "Bearish"
    return "Neutral"


def get_news_sentiment(ticker: str) -> dict:
    cached = _get_from_cache(ticker, "news")
    if cached:
        return cached

    ticker = ticker.upper()
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=30)

    news_data = _call_finnhub(
        "company-news",
        {
            "symbol": ticker,
            "from": start_date.isoformat(),
            "to": end_date.isoformat()
        }
    )
    # The free Finnhub plan may not expose news-sentiment. Use a neutral
    # score while still showing the available company news.
    score = 0.0

    articles = []
    for item in news_data[:10]:
        article_score = score
        articles.append({
            "title": item.get("headline", ""),
            "url": item.get("url", ""),
            "source": item.get("source", ""),
            "sentiment_label": _sentiment_label(article_score),
            "sentiment_score": article_score,
            "time_published": datetime.fromtimestamp(
                item["datetime"],
                tz=timezone.utc
            ).isoformat() if item.get("datetime") else ""
        })

    result = {
        "overall_sentiment_label": _sentiment_label(score),
        "overall_sentiment_score": score,
        "articles": articles
    }

    _set_cache(ticker, "news", result)
    return result


def get_stock_analysis(ticker: str) -> dict:
    ticker = ticker.upper()
    cached = _get_from_cache(ticker, "analysis")
    if cached:
        return cached

    technical = get_technical_indicators(ticker)
    news = get_news_sentiment(ticker)

    trend_score = 0
    if technical.get("trend") == "bullish":
        trend_score += 1
    elif technical.get("trend") == "bearish":
        trend_score -= 1

    rsi = technical.get("rsi")
    if rsi is not None:
        if rsi < 30:
            trend_score += 1
        elif rsi > 70:
            trend_score -= 1

    sentiment_score = news.get("overall_sentiment_score", 0)
    if sentiment_score > 0.1:
        trend_score += 1
    elif sentiment_score < -0.1:
        trend_score -= 1

    recommendation = (
        "Bullish" if trend_score >= 1
        else "Bearish" if trend_score <= -1
        else "Neutral"
    )

    result = {
        "ticker": ticker,
        **technical,
        **news,
        "recommendation": recommendation
    }

    _set_cache(ticker, "analysis", result)
    return result
