function AnalysisResult({ result }) {
  if (!result) {
    return null;
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                ✓
              </span>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Analysis Complete
                </h2>

                <p className="text-xs text-slate-500">
                  Screenshot processed successfully
                </p>
              </div>
            </div>

            {result.message && (
              <p className="mt-2 text-sm text-slate-500">
                {result.message}
              </p>
            )}
          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            Processing Complete
          </span>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-3">
          {/* Stocks Detected */}
          <div className="bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Stocks Detected
                </p>

                <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
                  {result.detected || 0}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm">
                📊
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Stocks identified from screenshot
            </p>
          </div>

          {/* New Records */}
          <div className="bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  New Records
                </p>

                <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
                  {result.new_records || 0}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-sm">
                ✓
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              New records saved to database
            </p>
          </div>

          {/* Duplicates */}
          <div className="bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Duplicates
                </p>

                <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
                  {result.duplicates || 0}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-sm">
                ↻
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Existing records detected
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalysisResult;