import { useState } from "react";

import {
  publishStock,
  publishAllStocks
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
        stock.ticker
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

      const publishedTickers = result.published?.map(
        (stock) => stock.ticker
      ) || [];

      setPublishedStocks((previous) => [
        ...new Set([
          ...previous,
          ...publishedTickers
        ])
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

    <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-sm">

      <div className="border-b px-6 py-4">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <h3 className="text-xl font-bold text-slate-900">
              Extracted Stocks
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Stock data extracted from the uploaded screenshot
            </p>

          </div>


          <button
            onClick={handlePublishAll}
            disabled={publishingAll}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {publishingAll
              ? "Publishing All..."
              : "Publish All Stocks"}

          </button>

        </div>

      </div>


      {error && (

        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          {error}

        </div>

      )}


      {bulkResult && (

        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

          <div className="font-semibold">
            Bulk publish completed
          </div>

          <div className="mt-1">

            Published: {bulkResult.published_count || 0}
            {" • "}
            Already Published: {bulkResult.duplicate_count || 0}
            {" • "}
            Failed: {bulkResult.failed_count || 0}

          </div>

        </div>

      )}


      <div className="overflow-x-auto">

        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 text-xs uppercase text-slate-500">

            <tr>

              <th className="px-6 py-4">
                Ticker
              </th>

              <th className="px-6 py-4">
                Price
              </th>

              <th className="px-6 py-4">
                Change
              </th>

              <th className="px-6 py-4">
                % Change
              </th>

              <th className="px-6 py-4">
                Volume % Change
              </th>

              <th className="px-6 py-4">
                Action
              </th>

            </tr>

          </thead>


          <tbody className="divide-y">

            {stocks.map((stock, index) => (

              <tr
                key={`${stock.ticker}-${index}`}
                className="hover:bg-slate-50"
              >

                <td className="px-6 py-4 font-semibold text-slate-900">
                  {stock.ticker}
                </td>


                <td className="px-6 py-4">
                  ${stock.price?.toFixed(2)}
                </td>


                <td className="px-6 py-4">

                  {stock.change > 0 ? "+" : ""}

                  {stock.change?.toFixed(2)}

                </td>


                <td className="px-6 py-4 font-medium">

                  {stock.change_percent > 0 ? "+" : ""}

                  {stock.change_percent?.toFixed(2)}%

                </td>


                <td className="px-6 py-4">

                  {stock.volume_change_percent > 0 ? "+" : ""}

                  {stock.volume_change_percent?.toFixed(0)}%

                </td>


                <td className="px-6 py-4">

                  {publishedStocks.includes(stock.ticker) ? (

                    <span className="font-semibold text-green-600">
                      ✓ Published
                    </span>

                  ) : (

                    <button
                      onClick={() => handlePublish(stock)}
                      disabled={
                        publishingTicker === stock.ticker ||
                        publishingAll
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {publishingTicker === stock.ticker
                        ? "Publishing..."
                        : "Publish"}

                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}


export default StockTable;