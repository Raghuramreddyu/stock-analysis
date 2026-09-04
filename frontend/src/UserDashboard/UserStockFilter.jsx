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
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <h3 className="text-lg font-semibold text-slate-900">
            Filter Stocks
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Select a date to view stocks published on that day.
          </p>

        </div>


        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Trading Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>

        </div>

      </div>

    </div>
  );
}


export default UserStockFilter;