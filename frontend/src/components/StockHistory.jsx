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

      const response = await fetch(
        `http://127.0.0.1:8000/api/stocks/${ticker.trim().toUpperCase()}/history`
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
        className="mt-10 rounded-xl bg-white shadow-sm"
    >

      {/* Header */}

      <div className="border-b px-6 py-5">

        <h3 className="text-xl font-bold text-slate-900">
          Stock History
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          View historical stock snapshots stored in MongoDB.
        </p>

      </div>


      {/* Search */}

      <div className="flex flex-col gap-3 p-6 sm:flex-row">

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
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />


        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Search"}
        </button>

      </div>


      {/* Error */}

      {error && (

        <div className="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>

      )}


      {/* History Table */}

      {history.length > 0 && (

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">

              <tr>

                <th className="px-6 py-4">
                  Ticker
                </th>

                <th className="px-6 py-4">
                  Date
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

              </tr>

            </thead>


            <tbody className="divide-y">

              {history.map((stock, index) => (

                <tr
                  key={`${stock.ticker}-${stock.tradingDate}-${index}`}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {stock.ticker}
                  </td>


                  <td className="px-6 py-4">
                    {stock.tradingDate}
                  </td>


                  <td className="px-6 py-4">
                    ${Number(stock.price).toFixed(2)}
                  </td>


                  <td className="px-6 py-4">
                    {Number(stock.change) > 0 ? "+" : ""}
                    {Number(stock.change).toFixed(2)}
                  </td>


                  <td className="px-6 py-4 font-medium">
                    {Number(stock.changePercent) > 0 ? "+" : ""}
                    {Number(stock.changePercent).toFixed(2)}%
                  </td>


                  <td className="px-6 py-4">
                    {Number(stock.volumeChangePercent) > 0 ? "+" : ""}
                    {Number(stock.volumeChangePercent).toFixed(0)}%
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* No Data */}

      {!loading && ticker && history.length === 0 && !error && (

        <div className="px-6 pb-6 text-sm text-slate-500">
          No history found for {ticker.toUpperCase()}.
        </div>

      )}

    </div>

  );
}


export default StockHistory;