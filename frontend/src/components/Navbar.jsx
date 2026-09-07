function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg shadow-sm">
            📈
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">
              Stock Analysis
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Market Intelligence
            </p>
          </div>
        </a>

        {/* Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          <a
            href="#home"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Dashboard
          </a>

          <a
            href="#stocks"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Stocks
          </a>

          <a
            href="#history"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            History
          </a>
        </div>

        {/* System Status */}
        <div className="hidden items-center gap-2.5 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 sm:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>

          <span className="text-xs font-semibold text-emerald-700">
            System Online
          </span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;