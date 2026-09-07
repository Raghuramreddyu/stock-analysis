function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <a
          href="#home"
          className="flex items-center gap-3"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lg">
            📈
          </div>

          <div>

            <p className="text-sm font-bold tracking-tight text-slate-900">
              Stock Analysis
            </p>

            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Market Intelligence
            </p>

          </div>

        </a>


        {/* Navigation */}

        <div className="hidden items-center gap-8 md:flex">

          <a
            href="#home"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Dashboard
          </a>

          <a
            href="#stocks"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Stocks
          </a>

          <a
            href="#history"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            History
          </a>

        </div>


        {/* System Status */}

        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">

          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>

          <span className="text-xs font-medium text-slate-600">
            System Online
          </span>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;