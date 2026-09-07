import { useEffect, useState } from "react";
import { getStockAnalysis } from "../../services/api";

function StockNews({ ticker }) {
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
          err.message || "Failed to load news sentiment."
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
          Loading news and sentiment...
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

  if (
    !analysis ||
    !analysis.articles ||
    analysis.articles.length === 0
  ) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-2xl">
          📰
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          No News Available
        </h3>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          No recent news articles are currently available for {ticker}.
        </p>
      </div>
    );
  }

  const getSentimentType = (label) => {
    const value = String(label || "").toLowerCase();

    if (value === "bullish") return "bullish";
    if (value === "bearish") return "bearish";

    return "neutral";
  };

  const getSentimentStyle = (label) => {
    const type = getSentimentType(label);

    if (type === "bullish") {
      return {
        badge: "border-green-200 bg-green-50 text-green-700",
        text: "text-green-600",
        icon: "📈",
      };
    }

    if (type === "bearish") {
      return {
        badge: "border-red-200 bg-red-50 text-red-700",
        text: "text-red-600",
        icon: "📉",
      };
    }

    return {
      badge: "border-slate-200 bg-slate-50 text-slate-600",
      text: "text-slate-600",
      icon: "➡️",
    };
  };

  const overallStyle = getSentimentStyle(
    analysis.overall_sentiment_label
  );

  const overallScore =
    analysis.overall_sentiment_score !== null &&
    analysis.overall_sentiment_score !== undefined &&
    Number.isFinite(Number(analysis.overall_sentiment_score))
      ? Number(analysis.overall_sentiment_score).toFixed(2)
      : "N/A";

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Market Research
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          News & Sentiment
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Recent news and sentiment signals for {ticker}.
        </p>
      </div>

      {/* Overall Sentiment */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Overall Sentiment
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${overallStyle.badge}`}
              >
                {overallStyle.icon}
              </div>

              <div>
                <p
                  className={`text-xl font-bold ${overallStyle.text}`}
                >
                  {analysis.overall_sentiment_label || "Neutral"}
                </p>

                <p className="text-xs text-slate-400">
                  Aggregated news sentiment
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-400">
              Sentiment Score
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {overallScore}
            </p>
          </div>
        </div>
      </div>

      {/* News Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Latest Articles
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            News Feed
          </h3>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {analysis.articles.length} article
          {analysis.articles.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* News Articles */}
      <div className="space-y-3">
        {analysis.articles.map((article, index) => {
          const sentimentStyle = getSentimentStyle(
            article.sentiment_label
          );

          const sentimentScore =
            article.sentiment_score !== null &&
            article.sentiment_score !== undefined &&
            Number.isFinite(Number(article.sentiment_score))
              ? Number(article.sentiment_score).toFixed(2)
              : "0.00";

          let formattedDate = "Date unknown";

          if (article.time_published) {
            const parsedDate = new Date(
              article.time_published
            );

            if (!Number.isNaN(parsedDate.getTime())) {
              formattedDate =
                parsedDate.toLocaleDateString();
            }
          }

          return (
            <article
              key={`${article.url || article.title || "article"}-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Article Content */}
                <div className="min-w-0 flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base font-bold leading-6 text-slate-900 transition hover:text-blue-600"
                  >
                    {article.title || "Untitled Article"}
                  </a>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {article.source || "Unknown Source"}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Sentiment */}
                <div
                  className={`shrink-0 rounded-lg border px-3 py-2 ${sentimentStyle.badge}`}
                >
                  <p className="text-xs font-medium opacity-70">
                    Sentiment
                  </p>

                  <p className="mt-0.5 text-sm font-bold">
                    {sentimentStyle.icon}{" "}
                    {article.sentiment_label || "Neutral"}
                  </p>

                  <p className="mt-0.5 text-xs opacity-70">
                    Score: {sentimentScore}
                  </p>
                </div>
              </div>

              {/* Read Article */}
              {article.url && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Read full article
                    <span>↗</span>
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Information Note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm">
            ℹ️
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              About sentiment
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              News sentiment represents the tone detected in the
              available articles. It is an analytical signal and
              should not be treated as a guaranteed prediction of
              future stock performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockNews;