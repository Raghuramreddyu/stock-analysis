function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-6 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        {/* Brand */}
        <div>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs">
              📈
            </div>

            <p className="text-sm font-bold text-slate-800">
              Stock Analysis
            </p>
          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            Market Intelligence Platform
          </p>
        </div>

        {/* Description */}
        <div className="text-center sm:text-right">
          <p className="text-xs font-medium text-slate-500">
            OCR-powered stock market data extraction
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            Data analysis • Historical insights • Market intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;