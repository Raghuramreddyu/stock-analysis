import { useEffect, useState } from "react";

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch all stocks
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/stocks"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to fetch stocks."
          );
        }
        console.log("API STOCK DATA:", data.stocks);
        setStocks(data.stocks || []);
      } catch (err) {
        setError(
          err.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Fetch history when a stock is selected
  useEffect(() => {
    if (!selectedTicker) {
      return;
    }

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);

        const response = await fetch(
          `http://127.0.0.1:8000/api/stocks/${selectedTicker}/history`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to fetch stock history."
          );
        }

        setStockHistory(data.history || []);
      } catch (err) {
        console.error("History fetch error:", err);
        setStockHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedTicker]);

  const handleSelectTicker = (ticker) => {
    setSelectedTicker(ticker);
    setStockHistory([]);
  };

  const handleCloseHistory = () => {
    setSelectedTicker(null);
    setStockHistory([]);
  };

  return (
    <div
      id="stocks"
      className="overflow-hidden rounded-xl"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm">
            📈
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Stored Stocks
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Stock market data stored in MongoDB
            </p>
          </div>
        </div>

        {!loading && !error && stocks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {stocks.length}{" "}
              {stocks.length === 1 ? "record" : "records"}
            </span>

            <span className="text-[11px] text-slate-400">
              Click a ticker to view history
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 px-5 py-8 text-sm text-slate-500 md:px-6">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></span>
          Loading stocks...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-3.5 md:m-6">
          <div className="flex items-start gap-2">
            <span>⚠️</span>

            <div>
              <p className="text-xs font-bold text-red-700">
                Unable to load stocks
              </p>

              <p className="mt-0.5 text-xs text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stocks Table */}
      {!loading &&
        !error &&
        stocks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50">
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
                {stocks.map((stock, index) => {
                  const changePercent = Number(
                    stock.change_percent
                  );
                  console.log(
                    "CHANGE DEBUG:",
                    stock.ticker,
                    stock.change_percent,
                    Number(stock.change_percent)
                  );

                  const isPositive = changePercent > 0;
                  const isNegative = changePercent < 0;

                  return (
                    <tr
                      key={`${stock.ticker}-${stock.trading_date}-${index}`}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Ticker */}
                      <td className="px-5 py-3.5 md:px-6">
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectTicker(
                              stock.ticker
                            )
                          }
                          className="flex items-center gap-3 text-left"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                            {stock.ticker?.slice(0, 2)}
                          </span>

                          <span className="font-bold text-blue-600 transition hover:text-blue-800">
                            {stock.ticker}
                          </span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-slate-500">
                        {stock.trading_date}
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
                        {Number(stock.change) > 0
                          ? "+"
                          : ""}
                        {Number(stock.change).toFixed(2)}
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
                          {changePercent > 0
                            ? "+"
                            : ""}
                          {changePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Volume Change */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-medium ${
                            Number(
                              stock.volume_change_percent
                            ) > 0
                              ? "text-emerald-600"
                              : Number(
                                  stock.volume_change_percent
                                ) < 0
                              ? "text-red-600"
                              : "text-slate-600"
                          }`}
                        >
                          {Number(
                            stock.volume_change_percent
                          ) > 0
                            ? "+"
                            : ""}
                          {Number(
                            stock.volume_change_percent
                          ).toFixed(0)}
                          %
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      {/* Selected Stock History */}
      {selectedTicker && (
        <div className="border-t border-slate-200 bg-slate-50/50">
          {/* History Header */}
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                  {selectedTicker}
                </span>

                <h4 className="text-sm font-bold text-slate-900">
                  Historical Market Data
                </h4>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Historical market data stored in MongoDB.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseHistory}
              className="w-fit rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          {/* History Loading */}
          {historyLoading && (
            <div className="flex items-center gap-3 px-5 pb-5 text-xs text-slate-500 md:px-6">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></span>
              Loading history...
            </div>
          )}

          {/* History Table */}
          {!historyLoading &&
            stockHistory.length > 0 && (
              <div className="overflow-x-auto px-5 pb-5 md:px-6">
                <table className="w-full min-w-[700px] overflow-hidden rounded-lg border border-slate-200 bg-white text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Price
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Change
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        % Change
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Volume % Change
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {stockHistory.map(
                      (stock, index) => {
                        const changePercent = Number(
                          stock.change_Percent
                        );

                        const isPositive =
                          changePercent > 0;

                        const isNegative =
                          changePercent < 0;

                        return (
                          <tr
                            key={`${stock.trading_date}-${index}`}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-slate-500">
                              {stock.trading_date}
                            </td>

                            <td className="px-4 py-3 font-semibold text-slate-800">
                              $
                              {Number(
                                stock.price
                              ).toFixed(2)}
                            </td>

                            <td
                              className={`px-4 py-3 font-medium ${
                                isPositive
                                  ? "text-emerald-600"
                                  : isNegative
                                  ? "text-red-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {Number(
                                stock.change
                              ) > 0
                                ? "+"
                                : ""}
                              {Number(
                                stock.change
                              ).toFixed(2)}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${
                                  isPositive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isNegative
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {changePercent > 0
                                  ? "+"
                                  : ""}
                                {changePercent.toFixed(
                                  2
                                )}
                                %
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-slate-600">
                                {Number(
                                  stock.volume_Change_Percent
                                ) > 0
                                  ? "+"
                                  : ""}
                                {Number(
                                  stock.volume_Change_Percent
                                ).toFixed(0)}
                                %
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {/* No History */}
          {!historyLoading &&
            stockHistory.length === 0 && (
              <div className="px-5 pb-5 md:px-6">
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-5">
                  <p className="text-xs text-slate-500">
                    No historical data found for{" "}
                    <span className="font-semibold text-slate-700">
                      {selectedTicker}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}
        </div>
      )}

      {/* No Data */}
      {!loading &&
        !error &&
        stocks.length === 0 && (
          <div className="px-5 py-8 md:px-6">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <div className="text-2xl">📊</div>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                No stock data found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Upload a market screenshot to create
                stock records.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

export default Stocks;