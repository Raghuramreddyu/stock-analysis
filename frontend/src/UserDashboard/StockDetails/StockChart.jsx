import { useEffect, useState } from "react";

import { getStockHistory } from "../../services/api";


function StockChart({ ticker }) {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function loadHistory() {

      try {

        setLoading(true);
        setError("");

        const data = await getStockHistory(ticker);

        setHistory(data.history || []);

      } catch (err) {

        setError(
          err.message || "Failed to load stock history."
        );

      } finally {

        setLoading(false);

      }
    }

    if (ticker) {
      loadHistory();
    }

  }, [ticker]);


  if (loading) {

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

        <p className="text-slate-500">
          Loading price history...
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


  if (history.length === 0) {

    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

        <div className="mb-4 text-4xl">
          📈
        </div>

        <h3 className="text-xl font-semibold text-slate-900">
          No Historical Data
        </h3>

        <p className="mt-2 text-slate-500">
          Historical price data will appear here once more
          trading-day records are available.
        </p>

      </div>
    );

  }


  const prices = history.map(
    (item) => Number(item.price)
  );

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  const priceRange = maxPrice - minPrice || 1;


  const chartWidth = 800;
  const chartHeight = 320;

  const padding = 40;


  const points = history.map((item, index) => {

    const x =
      history.length === 1
        ? chartWidth / 2
        : padding +
          (index / (history.length - 1)) *
            (chartWidth - padding * 2);


    const y =
      chartHeight -
      padding -
      ((Number(item.price) - minPrice) / priceRange) *
        (chartHeight - padding * 2);


    return {
      x,
      y,
      price: Number(item.price),
      date: item.tradingDate
    };

  });


  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="mb-6">

        <h3 className="text-xl font-semibold text-slate-900">
          Price History
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Historical closing prices for {ticker}
        </p>

      </div>


      {/* Chart */}

      <div className="w-full overflow-x-auto">

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="min-w-175 w-full"
        >

          {/* Horizontal grid lines */}

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
                className="text-slate-100"
              />
            );

          })}


          {/* Price line */}

          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
          />


          {/* Data points */}

          {points.map((point, index) => (

            <g key={index}>

              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                className="fill-blue-600"
              />

              <text
                x={point.x}
                y={point.y - 14}
                textAnchor="middle"
                className="fill-slate-700 text-[13px] font-semibold"
              >
                ${point.price.toFixed(2)}
              </text>

            </g>

          ))}

        </svg>

      </div>


      {/* History Table */}

      <div className="mt-8 overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-slate-200">

            <tr>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Date
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Price
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Change
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Change %
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-slate-100">

            {[...history]
              .reverse()
              .map((item, index) => (

                <tr
                  key={`${item.tradingDate}-${index}`}
                  className="hover:bg-slate-50"
                >

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.tradingDate}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-900">
                    ${Number(item.price).toFixed(2)}
                  </td>

                  <td
                    className={`px-4 py-3 font-medium ${
                      Number(item.change) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number(item.change) >= 0 ? "+" : ""}
                    {Number(item.change).toFixed(2)}
                  </td>

                  <td
                    className={`px-4 py-3 font-medium ${
                      Number(item.changePercent) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number(item.changePercent) >= 0 ? "+" : ""}
                    {Number(item.changePercent).toFixed(2)}%
                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}


export default StockChart;