import { useState, useEffect } from "react";
import StockChart from "./StockChart";
import TechnicalAnalysis from "./TechnicalAnalysis";
import StockNews from "./StockNews";
import { getStockAnalysis } from "../../services/api";

function StockDetails({ stock, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    async function loadAnalysis() {
      if (!stock?.ticker) return;

      try {
        setAnalysisLoading(true);
        setAnalysisError("");

        const data = await getStockAnalysis(stock.ticker);
        setAnalysis(data);
      } catch (err) {
        setAnalysisError(err.message || "Failed to load analysis");
      } finally {
        setAnalysisLoading(false);
      }
    }

    loadAnalysis();
  }, [stock?.ticker]);

  if (!stock) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-[1400px]">
          <button
            onClick={onBack}
            className="mb-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Stocks
          </button>

          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Stock Not Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please select a stock from the published stocks list.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const price = Number(stock.price);
  const change = Number(stock.change);
  const changePercent = Number(stock.changePercent);
  const volumePercent = Number(stock.volumeChangePercent);

  const isPositive = change >= 0;

  const formatNumber = (value) => {
    return Number.isFinite(value) ? value.toFixed(2) : "-";
  };

  const formatPercent = (value) => {
    return Number.isFinite(value)
      ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
      : "-";
  };

  const getTrendClass = (value) => {
    const normalized = String(value || "").toLowerCase();

    if (
      normalized.includes("bullish") ||
      normalized.includes("positive")
    ) {
      return "text-green-600";
    }

    if (
      normalized.includes("bearish") ||
      normalized.includes("negative")
    ) {
      return "text-red-600";
    }

    return "text-slate-600";
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Stock Analysis
            </p>

            <h1 className="text-lg font-bold text-slate-900">
              Market Intelligence
            </h1>
          </div>

          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            ← Back to Stocks
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Stock Header */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                  {stock.ticker?.slice(0, 2)}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                      {stock.ticker}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isPositive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {isPositive ? "Positive" : "Negative"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Admin-published market intelligence
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 px-5 py-3 md:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Trading Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {stock.tradingDate || "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Price */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current Price
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  ${formatNumber(price)}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-lg">
                $
              </div>
            </div>
          </div>

          {/* Daily Change */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Daily Change
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {change >= 0 ? "+" : ""}
                  {formatNumber(change)}
                </p>
              </div>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
                  isPositive
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {isPositive ? "↗" : "↘"}
              </div>
            </div>
          </div>

          {/* Change % */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Change %
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercent(changePercent)}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-lg text-green-600">
                %
              </div>
            </div>
          </div>

          {/* Volume */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Volume Change
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatPercent(volumePercent)}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-lg">
                📊
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-5">
          <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            {[
              ["overview", "Overview"],
              ["chart", "Price Chart"],
              ["technical", "Technical"],
              ["news", "News"],
              ["prediction", "Prediction"],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <section>
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Stock Summary */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Market Data
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Stock Overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Current published information for this stock.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-500">
                      Ticker
                    </span>

                    <span className="font-semibold text-slate-900">
                      {stock.ticker}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-500">
                      Current Price
                    </span>

                    <span className="font-semibold text-slate-900">
                      ${formatNumber(price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-500">
                      Daily Change
                    </span>

                    <span
                      className={`font-semibold ${
                        isPositive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {change >= 0 ? "+" : ""}
                      {formatNumber(change)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-500">
                      Change %
                    </span>

                    <span
                      className={`font-semibold ${
                        isPositive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercent(changePercent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-500">
                      Volume Change
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatPercent(volumePercent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-500">
                      Trading Date
                    </span>

                    <span className="font-semibold text-slate-900">
                      {stock.tradingDate || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Intelligence
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Analysis Summary
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Analysis generated from the available market data.
                  </p>
                </div>

                {analysisLoading && (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

                    <p className="text-sm text-slate-500">
                      Loading analysis data...
                    </p>
                  </div>
                )}

                {analysisError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-600">
                      {analysisError}
                    </p>
                  </div>
                )}

                {!analysisLoading && !analysisError && analysis && (
                  <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between py-4">
                      <span className="text-sm text-slate-500">
                        Recommendation
                      </span>

                      <span
                        className={`font-bold ${getTrendClass(
                          analysis.recommendation
                        )}`}
                      >
                        {analysis.recommendation || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <span className="text-sm text-slate-500">
                        Sentiment
                      </span>

                      <span
                        className={`font-bold ${getTrendClass(
                          analysis.overall_sentiment_label
                        )}`}
                      >
                        {analysis.overall_sentiment_label || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <span className="text-sm text-slate-500">
                        Trend
                      </span>

                      <span
                        className={`font-bold ${getTrendClass(
                          analysis.trend
                        )}`}
                      >
                        {analysis.trend
                          ? analysis.trend.charAt(0).toUpperCase() +
                            analysis.trend.slice(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {!analysisLoading && !analysis && !analysisError && (
                  <div className="rounded-lg bg-slate-50 p-5 text-center">
                    <p className="text-sm text-slate-500">
                      Analysis data is currently unavailable.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chart */}
          {activeTab === "chart" && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <StockChart ticker={stock.ticker} />
            </div>
          )}

          {/* Technical Analysis */}
          {activeTab === "technical" && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <TechnicalAnalysis ticker={stock.ticker} />
            </div>
          )}

          {/* News */}
          {activeTab === "news" && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <StockNews ticker={stock.ticker} />
            </div>
          )}

          {/* Prediction */}
          {activeTab === "prediction" && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                🤖
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Future Module
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                Stock Prediction
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Prediction models for 1, 3, 5 and 10 trading days
                will be added after sufficient historical market data
                is collected.
              </p>

              <div className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2">
                {["1 Day", "3 Days", "5 Days", "10 Days"].map((period) => (
                  <span
                    key={period}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500"
                  >
                    {period}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StockDetails;