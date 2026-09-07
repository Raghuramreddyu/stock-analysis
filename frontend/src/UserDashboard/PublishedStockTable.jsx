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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

        <p className="text-slate-500">
          Loading published stocks...
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


  if (stocks.length === 0) {

    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

        <div className="mb-4 text-4xl">
          📋
        </div>

        <h3 className="text-xl font-semibold text-slate-900">
          No Published Stocks
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-slate-500">
          Admin-published stocks will appear here.
        </p>

      </div>
    );

  }


  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 px-6 py-5">

        <h3 className="text-xl font-semibold text-slate-900">
          Published Stocks
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {stocks.length} stock{stocks.length !== 1 ? "s" : ""} published
          by the admin.
        </p>

      </div>


      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Ticker
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Price
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Change
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Change %
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Volume %
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Date
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Action
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-slate-100">

            {stocks.map((stock, index) => (

              <tr
                key={`${stock.ticker}-${stock.tradingDate}-${index}`}
                className="transition hover:bg-slate-50"
              >

                <td className="px-6 py-4">

                  <span className="font-bold text-slate-900">
                    {stock.ticker}
                  </span>

                </td>


                <td className="px-6 py-4 font-medium text-slate-800">
                  ${Number(stock.price).toFixed(2)}
                </td>


                <td
                  className={`px-6 py-4 font-medium ${
                    Number(stock.change) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Number(stock.change) >= 0 ? "+" : ""}
                  {Number(stock.change).toFixed(2)}
                </td>


                <td
                  className={`px-6 py-4 font-medium ${
                    Number(stock.changePercent) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Number(stock.changePercent) >= 0 ? "+" : ""}
                  {Number(stock.changePercent).toFixed(2)}%
                </td>


                <td className="px-6 py-4 text-slate-700">

                  {stock.volumeChangePercent != null
                    ? `${Number(stock.volumeChangePercent).toFixed(2)}%`
                    : "-"}

                </td>


                <td className="px-6 py-4 text-sm text-slate-500">
                  {stock.tradingDate || "-"}
                </td>


                <td className="px-6 py-4">

                  <button
                    type="button"
                    onClick={() => onSelectStock(stock)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Details
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}


export default PublishedStockTable;