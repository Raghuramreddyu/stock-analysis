function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">

      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-center md:flex-row md:items-center md:justify-between md:text-left">

        <div>
          <p className="text-sm font-semibold text-slate-700">
            Stock Analysis
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Market Intelligence Platform
          </p>
        </div>

        <p className="text-xs text-slate-400">
          OCR-powered stock market data extraction
        </p>

      </div>

    </footer>
  );
}

export default Footer;