function Hero() {
  return (
    <section className="mx-auto max-w-5xl py-2 text-center">
      {/* Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>

        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
          AI-Powered Market Analysis
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
        Turn Stock Screenshots
        <span className="block text-slate-500">
          Into Actionable Market Data
        </span>
      </h1>

      {/* Description */}
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
        Upload a stock market screenshot and automatically extract
        ticker, price, change and volume data using OCR-powered analysis.
      </p>

      {/* Feature Pills */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm">
          ✓ OCR Extraction
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm">
          ✓ Historical Data
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm">
          ✓ MongoDB Storage
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm">
          ✓ Market Insights
        </span>
      </div>
    </section>
  );
}

export default Hero;