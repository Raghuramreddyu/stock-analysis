import { useEffect, useState } from "react";

import { getStockAnalysis } from "../../services/api";


function StockNews({ ticker }) {

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
          err.message || "Failed to load news sentiment."
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
          Loading news and sentiment...
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


  if (!analysis || !analysis.articles || analysis.articles.length === 0) {

    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

        <p className="text-slate-500">
          No news articles available for this ticker.
        </p>

      </div>
    );

  }


  const getSentimentColor = (label) => {
    if (label === "Bullish" || label === "bullish") {
      return "bg-green-50 text-green-600 border-green-200";
    } else if (label === "Bearish" || label === "bearish") {
      return "bg-red-50 text-red-600 border-red-200";
    } else {
      return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };


  const getSentimentText = (label) => {
    if (label === "Bullish" || label === "bullish") {
      return "📈 Bullish";
    } else if (label === "Bearish" || label === "bearish") {
      return "📉 Bearish";
    } else {
      return "➡️ Neutral";
    }
  };


  return (
    <div className="space-y-6">

      {/* Sentiment Overview */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h3 className="text-lg font-semibold text-slate-900">
          Overall Sentiment
        </h3>

        <div className="mt-4 flex items-center gap-4">

          <div className={`rounded-lg border px-4 py-3 ${getSentimentColor(analysis.overall_sentiment_label)}`}>

            <p className="text-sm font-semibold">
              {getSentimentText(analysis.overall_sentiment_label)}
            </p>

            <p className="mt-1 text-xs opacity-75">
              Score: {analysis.overall_sentiment_score?.toFixed(2) || "N/A"}
            </p>

          </div>

        </div>

      </div>


      {/* News Articles */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-slate-900">
          Latest News
        </h3>

        {analysis.articles.map((article, index) => (

          <div 
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              <div className="flex-1">

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {article.title || "Untitled"}
                </a>

                <div className="mt-2 flex flex-wrap gap-2">

                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {article.source || "Unknown"}
                  </span>

                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {article.time_published ? new Date(article.time_published).toLocaleDateString() : "Date unknown"}
                  </span>

                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Sentiment: 
                  <span className={`ml-2 font-semibold ${
                    article.sentiment_label === "Bullish" || article.sentiment_label === "bullish"
                      ? "text-green-600"
                      : article.sentiment_label === "Bearish" || article.sentiment_label === "bearish"
                        ? "text-red-600"
                        : "text-slate-600"
                  }`}>
                    {article.sentiment_label || "Neutral"} ({article.sentiment_score?.toFixed(2) || "0.00"})
                  </span>
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}


export default StockNews;
