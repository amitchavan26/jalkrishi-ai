import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Card, Button, Skeleton, EmptyState } from "../components/ui";
import { useToast } from "../components/ui";
import {
  loadPrefs,
  savePrefs,
  isHidden,
  hide,
  snooze,
  clearAll,
} from "../alertPrefs";
import { AlertCircle, X, Eye } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await api.get("/api/alerts");
        setAlerts(res.data);
      } catch (err) {
        setError("Could not load alerts");
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  const visibleAlerts = alerts.filter(
    (alert) => !isHidden(prefs, alert.assessmentId),
  );
  const hiddenCount = alerts.filter((alert) =>
    isHidden(prefs, alert.assessmentId),
  ).length;

  const handleHide = (id) => {
    const nextPrefs = hide(prefs, id);
    setPrefs(nextPrefs);
    savePrefs(nextPrefs);
    toast.info("Alert hidden on this device");
  };

  const handleSnooze = (id) => {
    const now = Date.now();
    const nextPrefs = snooze(prefs, id, now, 86400000);
    setPrefs(nextPrefs);
    savePrefs(nextPrefs);
    toast.info("Alert snoozed for 1 day");
  };

  const handleShowAll = () => {
    const nextPrefs = clearAll();
    setPrefs(nextPrefs);
    savePrefs(nextPrefs);
  };

  if (loading) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-6">
            Alerts
          </h1>
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading alerts...</span>
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-6">
            Alerts
          </h1>
          <div
            role="alert"
            className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-4"
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-6">
            Alerts
          </h1>
          <EmptyState
            icon={() => (
              <svg
                aria-hidden="true"
                className="w-12 h-12 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            title="No alerts"
            text="No alerts. Your crops look safe."
          />
        </div>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-6">
            Alerts
          </h1>
          <div className="glass p-6 fade-up text-center">
            <p className="text-ink mb-4">
              All alerts are hidden on this device.
            </p>
            <Button variant="ghost" onClick={handleShowAll}>
              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
              Show all alerts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Alerts</h1>

        <div className="space-y-4">
          {visibleAlerts.map((alert, index) => (
            <article
              key={alert.assessmentId}
              className="relative overflow-hidden rounded-2xl p-4 fade-up"
              style={{
                animationDelay: `${index * 60}ms`,
                background:
                  "linear-gradient(135deg, rgba(190,18,60,.10), rgba(190,18,60,.02))",
                border: "1px solid rgba(190,18,60,.25)",
              }}
            >
              <div
                className="absolute top-3 left-3 flex items-center gap-1"
                aria-hidden="true"
              >
                <span className="w-2 h-2 rounded-full bg-danger motion-safe:animate-ping" />
                <span className="w-2 h-2 rounded-full bg-danger/30" />
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-ink">{alert.message}</p>
                <p className="text-sm text-muted">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to={"/assessments/" + alert.assessmentId}
                    className="text-primary font-semibold hover:underline"
                  >
                    View result
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHide(alert.assessmentId)}
                  >
                    Hide
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSnooze(alert.assessmentId)}
                  >
                    Snooze 1 day
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {hiddenCount > 0 && (
          <div className="mt-6 glass p-4 fade-up flex items-center justify-between">
            <p className="text-sm text-muted">
              {hiddenCount} hidden on this device
            </p>
            <Button variant="ghost" size="sm" onClick={handleShowAll}>
              Show all alerts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
