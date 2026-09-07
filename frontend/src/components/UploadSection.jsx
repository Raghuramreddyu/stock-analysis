function UploadSection({
  selectedFile,
  loading,
  error,
  onFileChange,
  onAnalyze,
}) {
  return (
    <section className="mx-auto mt-14 max-w-3xl">

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

        {/* Card Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 md:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg">
              📊
            </div>

            <div>

              <h2 className="font-semibold text-slate-900">
                Analyze Market Screenshot
              </h2>

              <p className="text-sm text-slate-500">
                Extract stock data using OCR
              </p>

            </div>

          </div>

          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 sm:block">
            OCR Ready
          </span>

        </div>


        {/* Upload Body */}

        <div className="p-6 md:p-8">

          <label className="group flex min-h-70 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-linear-to-b from-slate-50 to-white px-6 py-10 text-center transition-all duration-200 hover:border-slate-500 hover:bg-slate-50">

            {/* Upload Icon */}

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-md ring-1 ring-slate-100 transition-transform duration-200 group-hover:scale-105">
              ☁️
            </div>


            <h3 className="mt-6 text-lg font-semibold text-slate-900">
              Drop your screenshot here
            </h3>


            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Upload a screenshot from your stock market platform.
              We'll extract the ticker, price, change and volume data.
            </p>


            {/* Browse Button */}

            <div className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition group-hover:bg-slate-700">
              Browse Files
            </div>


            <p className="mt-3 text-xs text-slate-400">
              PNG or JPG • Maximum recommended size 10MB
            </p>


            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={onFileChange}
              className="hidden"
            />

          </label>


          {/* Selected File */}

          {selectedFile && (

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

              <div className="flex items-center justify-between px-4 py-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    🖼️
                  </div>


                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {selectedFile.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                  </div>

                </div>


                {/* Selected Status */}

                <div className="ml-4 flex shrink-0 items-center gap-2">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                    ✓
                  </span>

                  <span className="hidden text-xs font-semibold text-emerald-600 sm:block">
                    Ready
                  </span>

                </div>

              </div>

            </div>

          )}


          {/* Analyze Button */}

          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading ? (

              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>

                Analyzing Screenshot...
              </>

            ) : (

              <>
                <span>Analyze Screenshot</span>
                <span>→</span>
              </>

            )}

          </button>


          {/* Error */}

          {error && (

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

              <span className="text-lg">
                ⚠️
              </span>

              <div>

                <p className="text-sm font-semibold text-red-700">
                  Analysis failed
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </section>
  );
}

export default UploadSection;