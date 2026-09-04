import { useState } from "react";

import {
  getCurrentUser,
  logoutUser
} from "../services/api";

import PublishedStockTable from "./PublishedStockTable";
import UserStockFilter from "./UserStockFilter";
import StockDetails from "./StockDetails/StockDetails";


function UserDashboard() {

  const [currentUser] = useState(
    getCurrentUser()
  );

  const [tradingDate, setTradingDate] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);

  if (selectedStock) {
    return (
      <StockDetails
        stock={selectedStock}
        onBack={() => setSelectedStock(null)}
      />
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}

<header className="border-b border-slate-200 bg-white">

  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

    <div>

      <h1 className="text-xl font-bold text-slate-900">
        Stock Analysis
      </h1>

      <p className="text-sm text-slate-500">
        Market Intelligence Platform
      </p>

    </div>


    <div className="flex items-center gap-4">

      <div className="text-right">

        <p className="text-sm text-slate-500">
          Welcome
        </p>

        <p className="font-semibold text-slate-900">
          {currentUser?.name}
        </p>

      </div>


      <button
        onClick={() => {
          logoutUser();
          window.location.reload();
        }}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Logout
      </button>

    </div>

  </div>

</header>

      {/* Main Dashboard */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Dashboard Introduction */}

        <section className="mb-10">

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            User Dashboard
          </p>

          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Market Intelligence
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Explore stocks researched and published by our admin team.
          </p>

        </section>


        {/* Dashboard Sections */}

        <section className="grid gap-6 md:grid-cols-3">

          {/* Published Stocks */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              📊
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Published Stocks
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View stocks selected and published by the admin.
            </p>

          </div>


          {/* Market Analysis */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
              📈
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Market Analysis
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Analyze selected stocks using market data and indicators.
            </p>

          </div>


          {/* Research */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              🔎
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Research
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Explore research, news, sentiment and predictions.
            </p>

          </div>

        </section>


        {/* Published Stocks */}

        <section className="mt-10">

            <UserStockFilter
              onDateChange={setTradingDate}
            />

            <PublishedStockTable
              tradingDate={tradingDate}
              onSelectStock={setSelectedStock}
            />

        </section>

      </main>

    </div>
  );
}


export default UserDashboard;