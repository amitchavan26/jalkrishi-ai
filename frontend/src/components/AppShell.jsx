import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { clearToken, api } from "../api";
import { useTheme } from "../theme/ThemeProvider";
import ThemeToggle from "../theme/ThemeToggle";
import {
  LayoutDashboard,
  Tractor,
  Droplets,
  GitCompare,
  Bell,
  History,
  LogOut,
  User,
  Menu,
  X,
  ChevronRight,
  Sprout,
} from "lucide-react";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: "Farmer", email: "" });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const userMenuRef = useRef(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [meRes, alertsRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/alerts"),
        ]);
        setUser(meRes.data);
        if (alertsRes.data && alertsRes.data.length > 0) {
          setUnreadAlerts(alertsRes.data.length);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          clearToken();
          navigate("/login");
        }
      }
    }
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleMouseDown(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/farms", label: "Farms", icon: Tractor },
    { to: "/assess", label: "Assess", icon: Droplets },
    { to: "/compare", label: "Compare", icon: GitCompare },
    { to: "/alerts", label: "Alerts", icon: Bell, badge: unreadAlerts },
    { to: "/history", label: "History", icon: History },
  ];

  const breadcrumbMap = {
    "/dashboard": "Dashboard",
    "/farms": "Farm Management",
    "/assess": "New Assessment",
    "/compare": "Compare Crops",
    "/alerts": "Alerts & Stress",
    "/history": "Assessment History",
  };

  const currentPath = location.pathname;
  const breadcrumbTitle =
    breadcrumbMap[currentPath] ||
    (currentPath.startsWith("/assessments/")
      ? "Assessment Result"
      : "JalKrishi AI");

  const badgeValue = unreadAlerts > 9 ? "9+" : unreadAlerts;

  return (
    <div className="app-bg min-h-screen flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 p-6 glass border-r border-white/20 dark:border-white/10 shrink-0 sticky top-0 h-screen z-30">
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Sprout className="w-6 h-6" />
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

        <nav aria-label="Main navigation" className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-emerald-700 dark:hover:text-emerald-400"
                  } pill`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white font-bold">
                    {item.to === "/alerts" ? badgeValue : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile widget at bottom of sidebar */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-white/10 relative">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/50 dark:bg-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "F"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-40 glass backdrop-blur-xl border-b border-white/20 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-300"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                JalKrishi
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-white">
                {breadcrumbTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <button
              onClick={() => navigate("/alerts")}
              className="relative p-2.5 rounded-full bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition"
              aria-label="Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0F1A17] animate-pulse" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* User Avatar dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-sky-500 text-white font-bold flex items-center justify-center shadow-md hover:scale-105 transition"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={userDropdownOpen}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "F"}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass p-2 rounded-2xl shadow-xl z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/10 mb-1">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/farms");
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 transition"
                  >
                    My Farms
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 fade-up pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 w-80 glass p-6 flex flex-col justify-between shadow-2xl z-50"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <span className="glow-text text-xl font-extrabold">
                    JalKrishi AI
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-base transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white font-bold">
                          {item.to === "/alerts" ? badgeValue : item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-200/60 dark:border-white/10">
              <button
                onClick={handleLogout}
                className="btn w-full justify-center gap-2"
                style={{ background: "#be123c" }}
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 glass backdrop-blur-xl border-t border-white/20 dark:border-white/10 px-4 py-2 flex items-center justify-around z-40"
      >
        {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]].map(
          (item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center p-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-500 dark:text-slate-400"
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </NavLink>
            );
          },
        )}
      </nav>
    </div>
  );
}
