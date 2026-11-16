import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, clearToken } from "../api";
import {
  suitabilityLabel,
  suitabilityColor,
  suitabilityBadge,
} from "../labels";
import { Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart as ChartJS } from "chart.js";
import { useTheme } from "../theme/ThemeProvider";
import { chartColors } from "../chartTheme";
import {
  Card,
  StatCard,
  ProgressRing,
  Skeleton,
  EmptyState,
} from "../components/ui";
import {
  Tractor,
  ClipboardList,
  Bell,
  Gauge,
  Plus,
  Search,
  BarChart2,
} from "lucide-react";

ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

// Helper to convert hex to rgba
const hexToRgba = (hex, alpha) => {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const colors = chartColors(theme);

  const [name, setName] = useState("");
  const [farms, setFarms] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, farmsRes, assessmentsRes, alertsRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/farms"),
          api.get("/api/assessments"),
          api.get("/api/alerts"),
        ]);
        setName(meRes.data.name);
        setFarms(farmsRes.data);
        setAssessments(assessmentsRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          clearToken();
          navigate("/login");
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  // --- Memoized Calculations ---

  const counts = useMemo(() => {
    const c = { EXCELLENT: 0, GOOD: 0, RISKY: 0, NOT_RECOMMENDED: 0 };
    assessments.forEach((a) => {
      if (c.hasOwnProperty(a.suitability)) c[a.suitability]++;
    });
    return c;
  }, [assessments]);

  const avgRatio = useMemo(() => {
    if (assessments.length === 0) return "-";
    const sum = assessments.reduce((sum, a) => sum + a.ratio, 0);
    return (sum / assessments.length).toFixed(2);
  }, [assessments]);

  const doughnutData = useMemo(
    () => ({
      labels: [
        suitabilityLabel.EXCELLENT,
        suitabilityLabel.GOOD,
        suitabilityLabel.RISKY,
        suitabilityLabel.NOT_RECOMMENDED,
      ],
      datasets: [
        {
          data: [
            counts.EXCELLENT,
            counts.GOOD,
            counts.RISKY,
            counts.NOT_RECOMMENDED,
          ],
          backgroundColor: [
            suitabilityColor.EXCELLENT,
            suitabilityColor.GOOD,
            suitabilityColor.RISKY,
            suitabilityColor.NOT_RECOMMENDED,
          ],
        },
      ],
    }),
    [counts],
  );

  const lineData = useMemo(() => {
    const sorted = [...assessments].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    const last10 = sorted.slice(-10);

    return {
      labels: last10.map((a) => new Date(a.createdAt).toLocaleDateString()),
      datasets: [
        {
          label: "Ratio",
          data: last10.map((a) => a.ratio),
          borderColor: colors.supply,
          backgroundColor: hexToRgba(colors.supply, 0.15),
          fill: true,
          tension: 0.3,
          borderWidth: 3,
        },
        {
          label: "Safe level (1.0)",
          data: last10.map(() => 1.0),
          borderColor: colors.warn,
          borderDash: [6, 6],
          pointRadius: 0,
        },
      ],
    };
  }, [assessments, colors]);

  const recentAssessments = useMemo(
    () =>
      [...assessments]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [assessments],
  );

  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3),
    [alerts],
  );

  // Memoize Chart Options to prevent Chart.js re-initialization
  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: colors.text } },
        tooltip: { enabled: true },
      },
      scales: {
        x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
        y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
      },
    }),
    [colors],
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: colors.text } },
      },
    }),
    [colors],
  );

  const excellentOrGood = counts.EXCELLENT + counts.GOOD;
  const percentage =
    assessments.length > 0
      ? Math.round((excellentOrGood / assessments.length) * 100)
      : 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const farmText = farms.length === 1 ? "1 farm" : `${farms.length} farms`;
  const assessmentText =
    assessments.length === 1
      ? "1 assessment"
      : `${assessments.length} assessments`;

  // --- Render States ---

  if (loading) {
    return (
      <div role="status" className="p-4">
        <span className="sr-only">Loading dashboard...</span>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-3">
            <Skeleton className="h-28" />
          </div>
          <div>
            <Skeleton className="h-28" />
          </div>
          <div>
            <Skeleton className="h-28" />
          </div>
          <div>
            <Skeleton className="h-28" />
          </div>
          <div>
            <Skeleton className="h-28" />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <Skeleton className="h-56" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-56" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-56" />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <Skeleton className="h-56" />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <Skeleton className="h-56" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Could not load dashboard
        </div>
      </div>
    );
  }

  // --- Main UI ---

  return (
    <div className="p-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Hero card */}
        <Card
          className="sm:col-span-2 lg:col-span-3 relative overflow-hidden bg-gradient-to-br from-[#047857] to-[#0369a1] text-white fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <div className="relative z-10 p-6">
            <p className="text-sm opacity-90">{greeting}</p>
            <h1 className="text-3xl font-extrabold mt-1">Welcome, {name}</h1>
            <p className="mt-3 opacity-90">
              You have {farmText} and {assessmentText}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/farms"
                className="bg-white text-[#047857] px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition"
              >
                Add a farm
              </Link>
              <Link
                to="/assess"
                className="bg-white text-[#047857] px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition"
              >
                Assess a crop
              </Link>
              <Link
                to="/compare"
                className="bg-white text-[#047857] px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition"
              >
                Compare crops
              </Link>
            </div>
          </div>
        </Card>

        {/* 2. Health ring card */}
        {assessments.length > 0 && (
          <Card
            className="lg:col-span-1 fade-up"
            style={{ animationDelay: "60ms" }}
            hover
          >
            <div className="flex flex-col items-center">
              <ProgressRing
                value={percentage}
                label="Assessments rated Excellent or Good"
                size={130}
              >
                <span className="text-2xl font-extrabold tabular-nums">
                  {percentage}%
                </span>
              </ProgressRing>
              <p className="mt-3 text-sm text-muted text-center">
                Assessments rated Excellent or Good
              </p>
            </div>
          </Card>
        )}

        {/* 3. Four StatCards */}
        <StatCard
          label="Farms"
          value={farms.length}
          icon={Tractor}
          className="lg:col-span-1 fade-up"
          data-testid="stat-farms"
          style={{ animationDelay: "120ms" }}
        />
        <StatCard
          label="Assessments"
          value={assessments.length}
          icon={ClipboardList}
          className="lg:col-span-1 fade-up"
          data-testid="stat-assessments"
          style={{ animationDelay: "180ms" }}
        />
        <StatCard
          label="Alerts"
          value={alerts.length}
          icon={Bell}
          className="lg:col-span-1 fade-up"
          data-testid="stat-alerts"
          valueClassName={alerts.length > 0 ? "text-danger" : ""}
          style={{ animationDelay: "240ms" }}
        />
        <StatCard
          label="Average ratio"
          value={avgRatio}
          icon={Gauge}
          className="lg:col-span-1 fade-up"
          data-testid="stat-avg"
          style={{ animationDelay: "300ms" }}
        />

        {/* 4. Line chart card */}
        {assessments.length > 0 && (
          <Card
            className="sm:col-span-2 lg:col-span-2 fade-up"
            style={{ animationDelay: "360ms" }}
            hover
          >
            <h2 className="text-lg font-semibold mb-3">Ratio over time</h2>
            <div
              role="img"
              aria-label="Line chart of the water ratio over recent assessments"
            >
              <Line data={lineData} options={lineOptions} />
            </div>
          </Card>
        )}

        {/* 5. Doughnut chart card */}
        {assessments.length > 0 && (
          <Card
            className="lg:col-span-1 fade-up"
            style={{ animationDelay: "420ms" }}
            hover
          >
            <h2 className="text-lg font-semibold mb-3">Suitability mix</h2>
            <div
              role="img"
              aria-label="Doughnut chart of assessments by suitability"
            >
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </Card>
        )}

        {/* 6. Alerts timeline card */}
        <Card
          className="lg:col-span-1 fade-up"
          style={{ animationDelay: "480ms" }}
          hover
        >
          <h2 className="text-lg font-semibold mb-3">Recent alerts</h2>
          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id || alert.assessmentId + alert.createdAt}
                  className="relative pl-6 border-l-2 border-danger"
                >
                  <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-danger" />
                  <p className="text-sm text-ink">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <time className="text-xs text-muted">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </time>
                    <Link
                      to={"/assessments/" + alert.assessmentId}
                      className="text-xs text-primary hover:underline"
                    >
                      View alert
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No alerts. Your crops look safe.
            </p>
          )}
        </Card>

        {/* 7. Recent assessments card */}
        <Card
          className="sm:col-span-2 lg:col-span-2 fade-up"
          style={{ animationDelay: "540ms" }}
          hover
        >
          <h2 className="text-lg font-semibold mb-3">Recent assessments</h2>
          {recentAssessments.length > 0 ? (
            <div>
              {recentAssessments.map((a) => (
                <Link
                  key={a.id}
                  to={"/assessments/" + a.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  <span
                    style={{
                      background: suitabilityBadge[a.suitability].bg,
                      color: suitabilityBadge[a.suitability].fg,
                    }}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  >
                    {suitabilityLabel[a.suitability]}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={() => (
                <svg
                  aria-hidden="true"
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              )}
              title="No assessments yet."
              text="Run your first assessment to see water suitability for your crops."
              action={
                <Link to="/assess" className="text-primary hover:underline">
                  Run your first assessment
                </Link>
              }
            />
          )}
        </Card>

        {/* 8. Quick actions card */}
        <Card
          className="sm:col-span-2 lg:col-span-2 fade-up"
          style={{ animationDelay: "600ms" }}
          hover
        >
          <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/assess"
              className="p-4 rounded-xl border border-white/80 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <Plus aria-hidden className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-semibold text-ink">New assessment</h3>
              <p className="text-sm text-muted mt-1">
                Check a crop on one of your farms
              </p>
            </Link>
            <Link
              to="/compare"
              className="p-4 rounded-xl border border-white/80 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <BarChart2 aria-hidden className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-semibold text-ink">Compare crops</h3>
              <p className="text-sm text-muted mt-1">
                See which crop fits your water best
              </p>
            </Link>
            <Link
              to="/farms"
              className="p-4 rounded-xl border border-white/80 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <Search aria-hidden className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-semibold text-ink">Add farm</h3>
              <p className="text-sm text-muted mt-1">
                Pick a place and enter your water
              </p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
