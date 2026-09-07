import { useEffect, useState } from "react";

import { getUserStocks } from "../services/api";

function PublishedStockTable({ tradingDate, onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStocks() {
      try {
        setLoading(true);
        setError("");

        const data = await getUserStocks(tradingDate);
        setStocks(data.stocks || []);
      } catch (err) {
        setError(
          err.message || "Failed to load published stocks."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStocks();
  }, [tradingDate]);

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>

          <p className="text-sm font-medium text-slate-600">
            Loading published stocks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
            📋
          </div>

          <h3 className="text-lg font-semibold text-slate-900">
            No Published Stocks
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Admin-published stocks will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">

      {/* Table Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Published Stocks
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            {stocks.length} stock
            {stocks.length !== 1 ? "s" : ""} published by the admin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>

          <span className="text-xs font-medium text-slate-500">
            Live Published List
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">

          {/* Table Head */}
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ticker
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Price
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Change
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Change %
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Volume %
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {stocks.map((stock, index) => {
              const change = Number(stock.change);
              const changePercent = Number(stock.changePercent);

              const isPositive = change >= 0;
              const isPercentPositive = changePercent >= 0;

              return (
                <tr
                  key={`${stock.ticker}-${stock.tradingDate}-${index}`}
                  className="group transition hover:bg-slate-50"
                >

                  {/* Ticker */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                        {stock.ticker?.slice(0, 2)}
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {stock.ticker}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          Equity
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-800">
                      ${Number(stock.price).toFixed(2)}
                    </span>
                  </td>

                  {/* Change */}
                  <td
                    className={`px-5 py-3.5 font-semibold ${
                      isPositive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>
                        {isPositive ? "▲" : "▼"}
                      </span>

                      {isPositive ? "+" : ""}
                      {change.toFixed(2)}
                    </span>
                  </td>

                  {/* Change % */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${
                        isPercentPositive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {isPercentPositive ? "+" : ""}
                      {changePercent.toFixed(2)}%
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="px-5 py-3.5">
                    {stock.volumeChangePercent != null ? (
                      <span className="font-medium text-slate-700">
                        {Number(stock.volumeChangePercent).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium text-slate-500">
                      {stock.tradingDate || "—"}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => onSelectStock(stock)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                    >
                      View Details
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
        <p className="text-xs text-slate-400">
          Select a stock to view detailed market analysis,
          technical indicators and news.
        </p>
      </div>

    </div>
  );
}

export default PublishedStockTable;