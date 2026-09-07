import { useState } from "react";

import {
  publishStock,
  publishAllStocks,
} from "../services/api";

function StockTable({ stocks }) {
  const [publishingTicker, setPublishingTicker] = useState("");
  const [publishingAll, setPublishingAll] = useState(false);
  const [publishedStocks, setPublishedStocks] = useState([]);
  const [error, setError] = useState("");
  const [bulkResult, setBulkResult] = useState(null);

  if (!stocks || stocks.length === 0) {
    return null;
  }

  const handlePublish = async (stock) => {
    try {
      setPublishingTicker(stock.ticker);
      setError("");

      await publishStock(stock);

      setPublishedStocks((previous) => [
        ...previous,
        stock.ticker,
      ]);
    } catch (err) {
      setError(
        err.message || "Failed to publish stock"
      );
    } finally {
      setPublishingTicker("");
    }
  };

  const handlePublishAll = async () => {
    try {
      setPublishingAll(true);
      setError("");
      setBulkResult(null);

      const result = await publishAllStocks(stocks);

      setBulkResult(result);

      const publishedTickers =
        result.published?.map(
          (stock) => stock.ticker
        ) || [];

      setPublishedStocks((previous) => [
        ...new Set([
          ...previous,
          ...publishedTickers,
        ]),
      ]);
    } catch (err) {
      setError(
        err.message || "Failed to publish all stocks"
      );
    } finally {
      setPublishingAll(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm">
              📋
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Extracted Stocks
              </h3>

              <p className="text-xs text-slate-500">
                {stocks.length} stock
                {stocks.length !== 1 ? "s" : ""} detected
                from the uploaded screenshot
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublishAll}
          disabled={publishingAll}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishingAll
            ? "Publishing All..."
            : "Publish All Stocks"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 md:mx-6">
          <div className="flex items-start gap-2">
            <span>⚠️</span>

            <div>
              <p className="text-xs font-bold text-red-700">
                Publishing failed
              </p>

              <p className="mt-0.5 text-xs text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Result */}
      {bulkResult && (
        <div className="mx-5 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 md:mx-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="font-bold text-emerald-700">
              ✓ Bulk publish completed
            </span>

            <span className="text-emerald-700">
              Published:{" "}
              <strong>
                {bulkResult.published_count || 0}
              </strong>
            </span>

            <span className="text-emerald-700">
              Already Published:{" "}
              <strong>
                {bulkResult.duplicate_count || 0}
              </strong>
            </span>

            <span className="text-emerald-700">
              Failed:{" "}
              <strong>
                {bulkResult.failed_count || 0}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-y border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:px-6">
                Ticker
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

              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {stocks.map((stock, index) => {
              const isPositive =
                Number(stock.change_percent) > 0;

              const isNegative =
                Number(stock.change_percent) < 0;

              const isPublished =
                publishedStocks.includes(stock.ticker);

              return (
                <tr
                  key={`${stock.ticker}-${index}`}
                  className="transition hover:bg-slate-50"
                >
                  {/* Ticker */}
                  <td className="px-5 py-3.5 md:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                        {stock.ticker?.slice(0, 2)}
                      </div>

                      <span className="font-bold text-slate-900">
                        {stock.ticker}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    ${stock.price?.toFixed(2)}
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
                    {stock.change > 0 ? "+" : ""}
                    {stock.change?.toFixed(2)}
                  </td>

                  {/* % Change */}
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
                      {stock.change_percent > 0
                        ? "+"
                        : ""}
                      {stock.change_percent?.toFixed(2)}%
                    </span>
                  </td>

                  {/* Volume */}
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
                      {stock.volume_change_percent > 0
                        ? "+"
                        : ""}
                      {stock.volume_change_percent?.toFixed(
                        0
                      )}
                      %
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                        ✓ Published
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handlePublish(stock)
                        }
                        disabled={
                          publishingTicker ===
                            stock.ticker ||
                          publishingAll
                        }
                        className="rounded-md bg-blue-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {publishingTicker ===
                        stock.ticker
                          ? "Publishing..."
                          : "Publish"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3 md:px-6">
        <p className="text-[11px] text-slate-400">
          Review extracted values before publishing them
          to the user dashboard.
        </p>
      </div>
    </div>
  );
}

export default StockTable;