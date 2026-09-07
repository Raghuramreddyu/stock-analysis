import { useEffect, useState } from "react";
import { getStockHistory } from "../../services/api";

function StockChart({ ticker }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      if (!ticker) return;

      try {
        setLoading(true);
        setError("");

        const data = await getStockHistory(ticker);
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message || "Failed to load stock history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading price history...
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

  if (history.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          📈
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          No Historical Data
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Historical price data will appear here once more
          trading-day records are available.
        </p>
      </div>
    );
  }

  const prices = history
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const chartWidth = 900;
  const chartHeight = 340;
  const padding = 50;

  const points = history.map((item, index) => {
    const price = Number(item.price);

    const x =
      history.length === 1
        ? chartWidth / 2
        : padding +
          (index / (history.length - 1)) *
            (chartWidth - padding * 2);

    const y =
      chartHeight -
      padding -
      ((price - minPrice) / priceRange) *
        (chartHeight - padding * 2);

    return {
      x,
      y,
      price,
      date: item.tradingDate,
    };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const latestPrice = points[points.length - 1]?.price;
  const firstPrice = points[0]?.price;

  const overallChange =
    Number.isFinite(latestPrice) && Number.isFinite(firstPrice)
      ? latestPrice - firstPrice
      : 0;

  const overallChangePercent =
    firstPrice && Number.isFinite(firstPrice)
      ? (overallChange / firstPrice) * 100
      : 0;

  const overallPositive = overallChange >= 0;

  return (
    <div>
      {/* Chart Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Market Trend
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-900">
            Price History
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Historical closing prices for {ticker}
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div>
            <p className="text-xs text-slate-400">
              Latest Price
            </p>

            <p className="text-lg font-bold text-slate-900">
              ${latestPrice?.toFixed(2) || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Period Change
            </p>

            <p
              className={`text-lg font-bold ${
                overallPositive
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {overallPositive ? "+" : ""}
              {overallChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-auto min-w-[750px] w-full"
          >
            {/* Horizontal Grid Lines */}
            {[0, 1, 2, 3, 4].map((line) => {
              const y =
                padding +
                (line / 4) *
                  (chartHeight - padding * 2);

              return (
                <line
                  key={line}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200"
                  strokeWidth="1"
                />
              );
            })}

            {/* Price Line */}
            <polyline
              points={linePoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                overallPositive
                  ? "text-green-600"
                  : "text-red-600"
              }
            />

            {/* Data Points */}
            {points.map((point, index) => (
              <g key={`${point.date}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  className={
                    overallPositive
                      ? "fill-green-600"
                      : "fill-red-600"
                  }
                />

                <text
                  x={point.x}
                  y={point.y - 12}
                  textAnchor="middle"
                  className="fill-slate-600 text-[12px] font-semibold"
                >
                  ${point.price.toFixed(2)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* History Table */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Historical Records
            </h4>

            <p className="text-xs text-slate-500">
              {history.length} trading-day record
              {history.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Price
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Change
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Change %
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {[...history]
                  .reverse()
                  .map((item, index) => {
                    const itemChange = Number(item.change);
                    const itemChangePercent = Number(
                      item.changePercent
                    );

                    const positive = itemChange >= 0;

                    return (
                      <tr
                        key={`${item.tradingDate}-${index}`}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {item.tradingDate || "-"}
                        </td>

                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          ${Number(item.price).toFixed(2)}
                        </td>

                        <td
                          className={`px-4 py-3 text-sm font-semibold ${
                            positive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {Number.isFinite(itemChange)
                            ? itemChange.toFixed(2)
                            : "-"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              positive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {positive ? "+" : ""}
                            {Number.isFinite(itemChangePercent)
                              ? itemChangePercent.toFixed(2)
                              : "-"}
                            %
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockChart;