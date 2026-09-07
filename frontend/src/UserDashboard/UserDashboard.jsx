import { useState } from "react";

import {
  getCurrentUser,
  logoutUser
} from "../services/api";

import PublishedStockTable from "./PublishedStockTable";
import UserStockFilter from "./UserStockFilter";
import StockDetails from "./StockDetails/StockDetails";

function UserDashboard() {
  const [currentUser] = useState(getCurrentUser());
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
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-350 items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Stock Analysis
            </h1>

            <p className="text-xs text-slate-500">
              Market Intelligence Platform
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">
                Welcome
              </p>

              <p className="text-sm font-semibold text-slate-900">
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
      <main className="mx-auto max-w-350 px-6 py-7">

        {/* Dashboard Header */}
        <section className="mb-6">

          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
            User Dashboard
          </p>

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Market Intelligence
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Explore stocks researched and published by our admin team.
              </p>
            </div>

          </div>
        </section>

        {/* Dashboard Summary Cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Published Stocks */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Published Stocks
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  —
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                📊
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Admin-approved stocks
            </p>

          </div>

          {/* Market Analysis */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Market Analysis
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  —
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-lg">
                📈
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Technical market insights
            </p>

          </div>

          {/* Research */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Research
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  —
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-lg">
                🔎
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              News and stock research
            </p>

          </div>

          {/* Predictions */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Predictions
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  —
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg">
                🎯
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Future prediction module
            </p>

          </div>

        </section>

        {/* Stocks Section */}
        <section>

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Published Stocks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Stocks selected and published by the admin team.
              </p>
            </div>

          </div>

          {/* Filter */}
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <UserStockFilter
              onDateChange={setTradingDate}
            />
          </div>

          {/* Stock Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <PublishedStockTable
              tradingDate={tradingDate}
              onSelectStock={setSelectedStock}
            />
          </div>

        </section>

      </main>
    </div>
  );
}

export default UserDashboard;