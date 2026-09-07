import { useEffect, useState } from "react";

import { getStockAnalysis } from "../../services/api";


function TechnicalAnalysis({ ticker }) {

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function loadAnalysis() {

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

    if (ticker) {
      loadAnalysis();
    }

  }, [ticker]);


  if (loading) {

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

        <p className="text-slate-500">
          Loading technical analysis...
        </p>

      </div>
    );

  }


  if (error) {

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <p className="font-medium text-red-600">
          {error}
        </p>

      </div>
    );

  }


  if (!analysis) {

    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

        <p className="text-slate-500">
          No technical analysis available for this ticker.
        </p>

      </div>
    );

  }


  const trendColor = 
    analysis.trend === "bullish" 
      ? "text-green-600" 
      : analysis.trend === "bearish" 
        ? "text-red-600" 
        : "text-slate-600";


  const trendBg = 
    analysis.trend === "bullish" 
      ? "bg-green-50" 
      : analysis.trend === "bearish" 
        ? "bg-red-50" 
        : "bg-slate-50";


  return (
    <div className="space-y-6">

      {/* Trend Overview */}

      <div className={`rounded-2xl border border-slate-200 ${trendBg} p-6 shadow-sm`}>

        <h3 className="text-lg font-semibold text-slate-900">
          Trend Analysis
        </h3>

        <div className="mt-4 flex items-center gap-3">

          <span className={`text-4xl font-bold ${trendColor}`}>
            {analysis.trend === "bullish" ? "📈" : analysis.trend === "bearish" ? "📉" : "➡️"}
          </span>

          <div>

            <p className="text-sm text-slate-500">
              Overall Trend
            </p>

            <p className={`text-2xl font-bold ${trendColor}`}>
              {analysis.trend?.charAt(0).toUpperCase() + analysis.trend?.slice(1) || "N/A"}
            </p>

          </div>

        </div>

      </div>


      {/* Technical Indicators Grid */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">

        {/* RSI */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            RSI (Relative Strength Index)
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {analysis.rsi !== null && analysis.rsi !== undefined 
              ? analysis.rsi.toFixed(2) 
              : "N/A"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {analysis.rsi !== null && analysis.rsi !== undefined 
              ? analysis.rsi > 70 
                ? "Overbought"
                : analysis.rsi < 30
                  ? "Oversold"
                  : "Neutral"
              : "—"}
          </p>

        </div>


        {/* Last Close Price */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Last Close Price
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            ${analysis.last_close !== null && analysis.last_close !== undefined 
              ? analysis.last_close.toFixed(2) 
              : "N/A"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Current market price
          </p>

        </div>

      </div>


      {/* Moving Averages */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h3 className="text-lg font-semibold text-slate-900">
          Moving Averages
        </h3>

        <div className="mt-6 space-y-4">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">

            <span className="text-sm text-slate-500">
              SMA 50 (50-day)
            </span>

            <span className="font-semibold text-slate-900">
              ${analysis.sma_50 !== null && analysis.sma_50 !== undefined 
                ? analysis.sma_50.toFixed(2) 
                : "N/A"}
            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-sm text-slate-500">
              SMA 200 (200-day)
            </span>

            <span className="font-semibold text-slate-900">
              ${analysis.sma_200 !== null && analysis.sma_200 !== undefined 
                ? analysis.sma_200.toFixed(2) 
                : "N/A"}
            </span>

          </div>

        </div>

        {analysis.sma_50 !== null && analysis.sma_50 !== undefined && analysis.sma_200 !== null && analysis.sma_200 !== undefined && (
          <p className="mt-4 text-xs text-slate-500">
            {analysis.sma_50 > analysis.sma_200 
              ? "50-day MA above 200-day MA (Bullish signal)" 
              : analysis.sma_50 < analysis.sma_200
                ? "50-day MA below 200-day MA (Bearish signal)"
                : "50-day MA equals 200-day MA"}
          </p>
        )}

      </div>


    </div>
  );
}


export default TechnicalAnalysis;
