function Hero() {
  return (
    <section className="mx-auto max-w-4xl text-center">

      {/* Badge */}

      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">

        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>

        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          AI-Powered Market Analysis
        </span>

      </div>


      {/* Heading */}

      <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">

        Turn Stock Screenshots

        <span className="block text-slate-500">
          Into Market Data
        </span>

      </h1>


      {/* Description */}

      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">

        Upload a stock market screenshot and automatically
        extract ticker, price, change and volume data using
        OCR-powered analysis.

      </p>


      {/* Feature Pills */}

      <div className="mt-8 flex flex-wrap justify-center gap-3">

        <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
          OCR Extraction
        </span>

        <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
          Historical Data
        </span>

        <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
          MongoDB Storage
        </span>

      </div>

    </section>
  );
}

export default Hero;