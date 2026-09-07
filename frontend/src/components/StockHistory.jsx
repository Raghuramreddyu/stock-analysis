import { useState } from "react";

function StockHistory() {
  const [ticker, setTicker] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!ticker.trim()) {
      setError("Please enter a ticker.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const normalizedTicker = ticker.trim().toUpperCase();

      const response = await fetch(
        `http://127.0.0.1:8000/api/stocks/${normalizedTicker}/history`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch stock history."
        );
      }

      setHistory(data.history || []);
    } catch (err) {
      setHistory([]);
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="history"
      className="overflow-hidden rounded-xl"
    >
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm">
            🕒
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Stock History
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Search historical stock snapshots stored in MongoDB.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              🔎
            </span>

            <input
              type="text"
              placeholder="Enter ticker (e.g. VIST)"
              value={ticker}
              onChange={(event) =>
                setTicker(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="h-11 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Loading...
              </span>
            ) : (
              "Search History"
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3.5 md:mx-6">
          <div className="flex items-start gap-2">
            <span>⚠️</span>

            <div>
              <p className="text-xs font-bold text-red-700">
                Search failed
              </p>

              <p className="mt-0.5 text-xs text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Result Summary */}
      {!loading && !error && history.length > 0 && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
              {ticker.trim().toUpperCase()}
            </span>

            <span className="text-xs text-slate-500">
              Historical records
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-400">
            {history.length}{" "}
            {history.length === 1 ? "record" : "records"}
          </span>
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:px-6">
                  Ticker
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Date
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Price
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Change
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  % Change
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Volume % Change
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {history.map((stock, index) => {
                const change = Number(stock.change);
                const changePercent = Number(
                  stock.changePercent
                );
                const volumeChange = Number(
                  stock.volumeChangePercent
                );

                const isPositive = changePercent > 0;
                const isNegative = changePercent < 0;

                return (
                  <tr
                    key={`${stock.ticker}-${stock.tradingDate}-${index}`}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Ticker */}
                    <td className="px-5 py-3.5 md:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                          {stock.ticker?.slice(0, 2)}
                        </span>

                        <span className="font-bold text-slate-900">
                          {stock.ticker}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-slate-500">
                      {stock.tradingDate}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      ${Number(stock.price).toFixed(2)}
                    </td>

                    {/* Change */}
                    <td
                      className={`px-5 py-3.5 font-medium ${
                        isPositive
                          ? "text-emerald-600"
                          : isNegative
                          ? "text-red-600"
                          : "text-slate-600"
                      }`}
                    >
                      {change > 0 ? "+" : ""}
                      {change.toFixed(2)}
                    </td>

                    {/* Percentage Change */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-700"
                            : isNegative
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isPositive
                          ? "▲"
                          : isNegative
                          ? "▼"
                          : "—"}{" "}
                        {changePercent > 0 ? "+" : ""}
                        {changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Volume Change */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-medium ${
                          volumeChange > 0
                            ? "text-emerald-600"
                            : volumeChange < 0
                            ? "text-red-600"
                            : "text-slate-600"
                        }`}
                      >
                        {volumeChange > 0 ? "+" : ""}
                        {volumeChange.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data */}
      {!loading &&
        !error &&
        ticker &&
        history.length === 0 && (
          <div className="px-5 py-7 md:px-6">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <div className="text-2xl">📭</div>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                No history found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No historical records were found for{" "}
                <span className="font-semibold text-slate-700">
                  {ticker.toUpperCase()}
                </span>
                .
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

export default StockHistory;