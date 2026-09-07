import { useState } from "react";

function UserStockFilter({ onDateChange }) {
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    onDateChange(date);
  };

  const handleClear = () => {
    setSelectedDate("");
    onDateChange("");
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-lg">
            📅
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Filter Stocks
            </h3>

            <p className="text-xs text-slate-500">
              View published stocks by trading date.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label
            htmlFor="trading-date"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Trading Date
          </label>

          <input
            id="trading-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default UserStockFilter;