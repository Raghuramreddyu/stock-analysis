import { useState } from "react";
import StockChart from "./StockChart";


function StockDetails({ stock, onBack }) {

  const [activeTab, setActiveTab] = useState("overview");


  if (!stock) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-7xl">

          <button
            onClick={onBack}
            className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Stocks
          </button>


          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <h2 className="text-xl font-semibold text-slate-900">
              Stock Not Found
            </h2>

            <p className="mt-2 text-slate-500">
              Please select a stock from the published stocks list.
            </p>

          </div>

        </div>

      </div>
    );
  }


  const price = Number(stock.price);
  const change = Number(stock.change);
  const changePercent = Number(stock.changePercent);
  const volumePercent = Number(stock.volumeChangePercent);


  const isPositive = change >= 0;


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>

            <p className="text-sm text-slate-500">
              Stock Analysis
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Stock Details
            </h1>

          </div>


          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Stocks
          </button>

        </div>

      </header>


      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Stock Heading */}

        <section className="mb-8">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Published Stock
              </p>

              <div className="flex items-center gap-4">

                <h2 className="text-4xl font-bold text-slate-900">
                  {stock.ticker}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    isPositive
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {isPositive ? "Positive" : "Negative"}
                </span>

              </div>

              <p className="mt-2 text-slate-500">
                Market data published by the admin
              </p>

            </div>


            <div className="text-left md:text-right">

              <p className="text-sm text-slate-500">
                Trading Date
              </p>

              <p className="font-semibold text-slate-900">
                {stock.tradingDate || "-"}
              </p>

            </div>

          </div>

        </section>


        {/* Key Metrics */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Price */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Current Price
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ${price.toFixed(2)}
            </p>

          </div>


          {/* Change */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Daily Change
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                isPositive
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}
            </p>

          </div>


          {/* Change % */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Change %
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                isPositive
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%
            </p>

          </div>


          {/* Volume */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Volume Change
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {volumePercent >= 0 ? "+" : ""}
              {volumePercent.toFixed(2)}%
            </p>

          </div>

        </section>


        {/* Navigation Tabs */}

        <section className="mt-10">

          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Overview
            </button>


            <button
              onClick={() => setActiveTab("chart")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "chart"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Price Chart
            </button>


            <button
              onClick={() => setActiveTab("technical")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "technical"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Technical
            </button>


            <button
              onClick={() => setActiveTab("news")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "news"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              News
            </button>


            <button
              onClick={() => setActiveTab("prediction")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "prediction"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Prediction
            </button>

          </div>

        </section>


        {/* Content */}

        <section className="mt-6">

          {activeTab === "overview" && (

            <div className="grid gap-6 lg:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="text-xl font-semibold text-slate-900">
                  Stock Overview
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This section will contain a detailed summary of the
                  selected stock using market data and research.
                </p>


                <div className="mt-6 space-y-4">

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                    <span className="text-sm text-slate-500">
                      Ticker
                    </span>

                    <span className="font-semibold text-slate-900">
                      {stock.ticker}
                    </span>

                  </div>


                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                    <span className="text-sm text-slate-500">
                      Price
                    </span>

                    <span className="font-semibold text-slate-900">
                      ${price.toFixed(2)}
                    </span>

                  </div>


                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                    <span className="text-sm text-slate-500">
                      Trading Date
                    </span>

                    <span className="font-semibold text-slate-900">
                      {stock.tradingDate || "-"}
                    </span>

                  </div>


                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Published By
                    </span>

                    <span className="font-semibold text-slate-900">
                      Admin
                    </span>

                  </div>

                </div>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="text-xl font-semibold text-slate-900">
                  Analysis Coming Soon
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Advanced stock analysis will be added here as we
                  connect historical market data and external APIs.
                </p>


                <div className="mt-6 space-y-3">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="font-medium text-slate-900">
                      📈 Historical Price Analysis
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Analyze historical price movements.
                    </p>

                  </div>


                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="font-medium text-slate-900">
                      📊 Technical Indicators
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Moving averages, RSI, MACD and other indicators.
                    </p>

                  </div>


                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="font-medium text-slate-900">
                      🤖 Prediction
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Future direction and confidence analysis.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          )}


          {activeTab === "chart" && (

            <StockChart
                ticker={stock.ticker}
            />

        )}


          {activeTab === "technical" && (

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mb-4 text-5xl">
                📊
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                Technical Analysis
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-slate-500">
                RSI, moving averages, MACD and other technical
                indicators will be added here.
              </p>

            </div>

          )}


          {activeTab === "news" && (

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mb-4 text-5xl">
                📰
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                Market News
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-slate-500">
                Stock-related news and sentiment analysis will be
                connected through an external API later.
              </p>

            </div>

          )}


          {activeTab === "prediction" && (

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mb-4 text-5xl">
                🤖
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                Stock Prediction
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-slate-500">
                Prediction models for 1, 3, 5 and 10 trading days
                will be added after we collect sufficient market data.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


export default StockDetails;