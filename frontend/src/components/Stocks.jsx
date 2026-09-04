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


  return (

    <div
      id="stocks"
      className="mt-10 rounded-xl bg-white shadow-sm"
    >

      {/* Header */}

      <div className="border-b px-6 py-5">

        <h3 className="text-xl font-bold text-slate-900">
          Stocks
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Stock data stored in MongoDB.
        </p>

      </div>


      {/* Loading */}

      {loading && (

        <div className="p-6 text-sm text-slate-500">
          Loading stocks...
        </div>

      )}


      {/* Error */}

      {error && (

        <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>

      )}


      {/* Stocks Table */}

      {!loading && !error && stocks.length > 0 && (

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

              {stocks.map((stock, index) => (

                <tr
                  key={`${stock.ticker}-${stock.tradingDate}-${index}`}
                  className="hover:bg-slate-50"
                >

                  {/* Ticker */}

                  <td className="px-6 py-4">

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTicker(stock.ticker);
                      }}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {stock.ticker}
                    </button>

                  </td>


                  {/* Date */}

                  <td className="px-6 py-4">
                    {stock.tradingDate}
                  </td>


                  {/* Price */}

                  <td className="px-6 py-4">
                    ${Number(stock.price).toFixed(2)}
                  </td>


                  {/* Change */}

                  <td className="px-6 py-4">

                    {Number(stock.change) > 0 ? "+" : ""}
                    {Number(stock.change).toFixed(2)}

                  </td>


                  {/* Percentage Change */}

                  <td className="px-6 py-4 font-medium">

                    {Number(stock.changePercent) > 0 ? "+" : ""}
                    {Number(stock.changePercent).toFixed(2)}%

                  </td>


                  {/* Volume Change */}

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


      {/* Selected Stock History */}

      {selectedTicker && (

        <div className="border-t px-6 py-6">

          <div className="flex items-center justify-between">

            <div>

              <h4 className="text-lg font-bold text-slate-900">
                {selectedTicker} History
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Historical snapshots stored in MongoDB.
              </p>

            </div>


            <button
              type="button"
              onClick={() => {
                setSelectedTicker(null);
                setStockHistory([]);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>

          </div>


          {/* History Loading */}

          {historyLoading && (

            <p className="mt-6 text-sm text-slate-500">
              Loading history...
            </p>

          )}


          {/* History Table */}

          {!historyLoading && stockHistory.length > 0 && (

            <div className="mt-6 overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                  <tr>

                    <th className="px-4 py-3">
                      Date
                    </th>

                    <th className="px-4 py-3">
                      Price
                    </th>

                    <th className="px-4 py-3">
                      Change
                    </th>

                    <th className="px-4 py-3">
                      % Change
                    </th>

                    <th className="px-4 py-3">
                      Volume % Change
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y">

                  {stockHistory.map((stock, index) => (

                    <tr
                      key={`${stock.tradingDate}-${index}`}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-4 py-3">
                        {stock.tradingDate}
                      </td>

                      <td className="px-4 py-3">
                        ${Number(stock.price).toFixed(2)}
                      </td>

                      <td className="px-4 py-3">

                        {Number(stock.change) > 0 ? "+" : ""}
                        {Number(stock.change).toFixed(2)}

                      </td>

                      <td className="px-4 py-3 font-medium">

                        {Number(stock.changePercent) > 0 ? "+" : ""}
                        {Number(stock.changePercent).toFixed(2)}%

                      </td>

                      <td className="px-4 py-3">

                        {Number(stock.volumeChangePercent) > 0 ? "+" : ""}
                        {Number(stock.volumeChangePercent).toFixed(0)}%

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}


          {/* No History */}

          {!historyLoading && stockHistory.length === 0 && (

            <p className="mt-6 text-sm text-slate-500">
              No historical data found for {selectedTicker}.
            </p>

          )}

        </div>

      )}


      {/* No Data */}

      {!loading && !error && stocks.length === 0 && (

        <div className="p-6 text-sm text-slate-500">
          No stock data found.
        </div>

      )}

    </div>

  );

}


export default Stocks;