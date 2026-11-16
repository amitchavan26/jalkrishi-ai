// Legacy layout, kept for its tests; the app uses AppShell.
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { clearToken } from "../api";
import ThemeToggle from "../theme/ThemeToggle";

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="app-bg min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 p-6 glass border-r border-white/20 dark:border-white/10 shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z" />
            </svg>
          </div>
          <div>
            <span className="glow-text text-xl font-extrabold tracking-tight block">
              JalKrishi AI
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Agri-Water Intelligence
            </span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-dark-200 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/farms"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-dark-200 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 22h20" />
              <path d="M6 22V4" />
              <path d="M10 22V4" />
              <path d="M14 22V4" />
              <path x="18" y="22V4" />
              <path d="M2 18h20" />
              <path d="M2 14h20" />
            </svg>
            <span>Farms</span>
          </NavLink>
          <NavLink
            to="/assess"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-dark-200 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span>Assess</span>
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-dark-200 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Compare</span>
          </NavLink>
          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-dark-200 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Alerts</span>
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-dark-200 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>History</span>
          </NavLink>
        </nav>

        <div className="pt-6 border-t border-slate-200/60 dark:border-white/10">
          <button
            onClick={handleLogout}
            className="btn w-full justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 glass backdrop-blur-xl border-b border-white/20 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              JalKrishi
            </span>
            <svg
              className="w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="font-semibold text-slate-900 dark:text-white">
              Dashboard
            </span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
