function AnalysisResult({ result }) {

  if (!result) {
    return null;
  }


  return (
    <section className="mx-auto mt-10 max-w-5xl">

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        {/* Header */}

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>

            <div className="flex items-center gap-2">

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">
                ✓
              </span>

              <h2 className="text-xl font-bold text-slate-900">
                Analysis Complete
              </h2>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              {result.message}
            </p>

          </div>

        </div>


        {/* Statistics */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">


          {/* Stocks Detected */}

          <div className="rounded-xl bg-slate-50 p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Stocks Detected
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {result.detected || 0}
            </p>

          </div>


          {/* New Records */}

          <div className="rounded-xl bg-slate-50 p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              New Records
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {result.new_records || 0}
            </p>

          </div>


          {/* Duplicates */}

          <div className="rounded-xl bg-slate-50 p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Duplicates
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {result.duplicates || 0}
            </p>

          </div>


        </div>

      </div>

    </section>
  );
}


export default AnalysisResult;