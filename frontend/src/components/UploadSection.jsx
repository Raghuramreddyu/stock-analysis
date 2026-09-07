function UploadSection({
  selectedFile,
  loading,
  error,
  onFileChange,
  onAnalyze,
}) {
  return (
    <section className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📊
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Analyze Market Screenshot
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Extract stock data using OCR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>

            <span className="text-[11px] font-bold text-emerald-700">
              OCR Ready
            </span>
          </div>
        </div>

        {/* Upload Body */}
        <div className="p-5 md:p-6">
          <label className="group flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/30">
            {/* Upload Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-slate-200 transition-transform duration-200 group-hover:scale-105">
              ☁️
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              Drop your screenshot here
            </h3>

            <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
              Upload a screenshot from your stock market platform.
              We'll extract ticker, price, change and volume data.
            </p>

            {/* Browse Button */}
            <div className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-blue-700">
              Browse Files
            </div>

            <p className="mt-2.5 text-[11px] text-slate-400">
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
            <div className="mt-4 overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50">
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                    🖼️
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {selectedFile.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

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
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5">
              <span className="text-base">⚠️</span>

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Analysis failed
                </p>

                <p className="mt-0.5 text-xs leading-5 text-red-600">
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