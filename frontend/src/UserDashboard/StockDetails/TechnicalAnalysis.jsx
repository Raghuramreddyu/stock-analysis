import { useEffect, useState } from "react";
import { getStockAnalysis } from "../../services/api";

function TechnicalAnalysis({ ticker }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalysis() {
      if (!ticker) return;

      try {
        setLoading(true);
        setError("");

        const data = await getStockAnalysis(ticker);
        setAnalysis(data);
      } catch (err) {
        setError(
          err.message || "Failed to load technical analysis."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading technical analysis...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-2xl">
          📊
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          No Technical Analysis
        </h3>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          No technical analysis is currently available for {ticker}.
        </p>
      </div>
    );
  }

  const trend = String(analysis.trend || "").toLowerCase();

  const trendColor =
    trend === "bullish"
      ? "text-green-600"
      : trend === "bearish"
        ? "text-red-600"
        : "text-slate-600";

  const trendBg =
    trend === "bullish"
      ? "bg-green-50 border-green-100"
      : trend === "bearish"
        ? "bg-red-50 border-red-100"
        : "bg-slate-50 border-slate-200";

  const trendIcon =
    trend === "bullish"
      ? "📈"
      : trend === "bearish"
        ? "📉"
        : "➡️";

  const formatValue = (value) => {
    return value !== null &&
      value !== undefined &&
      Number.isFinite(Number(value))
      ? Number(value).toFixed(2)
      : "N/A";
  };

  const rsiValue =
    analysis.rsi !== null &&
    analysis.rsi !== undefined
      ? Number(analysis.rsi)
      : null;

  const rsiStatus =
    rsiValue === null
      ? "—"
      : rsiValue > 70
        ? "Overbought"
        : rsiValue < 30
          ? "Oversold"
          : "Neutral";

  const rsiStatusClass =
    rsiStatus === "Overbought"
      ? "text-red-600 bg-red-50"
      : rsiStatus === "Oversold"
        ? "text-green-600 bg-green-50"
        : "text-slate-600 bg-slate-50";

  const hasMovingAverages =
    analysis.sma_50 !== null &&
    analysis.sma_50 !== undefined &&
    analysis.sma_200 !== null &&
    analysis.sma_200 !== undefined;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Technical Indicators
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          Technical Analysis
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Technical indicators and trend signals for {ticker}.
        </p>
      </div>

      {/* Trend Overview */}
      <div
        className={`rounded-xl border p-5 ${trendBg}`}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Overall Trend
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl">
                {trendIcon}
              </span>

              <span
                className={`text-2xl font-bold ${trendColor}`}
              >
                {trend
                  ? trend.charAt(0).toUpperCase() +
                    trend.slice(1)
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-white/70 px-4 py-3">
            <p className="text-xs text-slate-400">
              Ticker
            </p>

            <p className="text-sm font-bold text-slate-900">
              {ticker}
            </p>
          </div>
        </div>
      </div>

      {/* Key Indicators */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* RSI */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                RSI
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Relative Strength Index
              </p>
            </div>

            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
              14D
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <p className="text-3xl font-bold text-slate-900">
              {formatValue(rsiValue)}
            </p>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rsiStatusClass}`}
            >
              {rsiStatus}
            </span>
          </div>
        </div>

        {/* Last Close */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last Close
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Latest market closing price
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-sm">
              $
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            ${formatValue(analysis.last_close)}
          </p>
        </div>
      </div>

      {/* Moving Averages */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Trend Indicator
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Moving Averages
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Comparison of short-term and long-term price trends.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* SMA 50 */}
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              SMA 50
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              ${formatValue(analysis.sma_50)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              50-day moving average
            </p>
          </div>

          {/* SMA 200 */}
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              SMA 200
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              ${formatValue(analysis.sma_200)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              200-day moving average
            </p>
          </div>
        </div>

        {/* MA Signal */}
        {hasMovingAverages && (
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {analysis.sma_50 > analysis.sma_200
                  ? "📈"
                  : analysis.sma_50 < analysis.sma_200
                    ? "📉"
                    : "➡️"}
              </span>

              <p
                className={`text-sm font-medium ${
                  analysis.sma_50 > analysis.sma_200
                    ? "text-green-600"
                    : analysis.sma_50 < analysis.sma_200
                      ? "text-red-600"
                      : "text-slate-600"
                }`}
              >
                {analysis.sma_50 > analysis.sma_200
                  ? "50-day MA is above the 200-day MA — Bullish signal"
                  : analysis.sma_50 < analysis.sma_200
                    ? "50-day MA is below the 200-day MA — Bearish signal"
                    : "50-day MA equals the 200-day MA"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Indicator Explanation */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm">
            ℹ️
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              How to read these indicators
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              RSI helps identify overbought or oversold conditions,
              while moving averages help identify the broader price
              trend. These indicators are signals and should not be
              treated as guaranteed predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicalAnalysis;