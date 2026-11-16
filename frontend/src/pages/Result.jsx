import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import RatioGauge from "../components/RatioGauge";
import { suitabilityBadge, suitabilityLabel } from "../labels";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useTheme } from "../theme/ThemeProvider";
import { chartColors } from "../chartTheme";
import { toCsv } from "../reportCsv";
import { Lightbulb, Download, Printer } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Result() {
  const { id } = useParams();
  const { theme } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await api.get("/api/reports/" + id);
        setReport(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load result");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-3xl mx-auto" role="status">
          <span className="sr-only">Loading result...</span>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-2xl mx-auto">
          <div
            className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-4"
            role="alert"
          >
            {error}
          </div>
          <Link
            to="/"
            className="text-blue-700 font-semibold hover:text-sky-700 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { assessment, breakdown } = report;
  const colors = chartColors(theme);

  function getStressLabel(stress) {
    switch (stress) {
      case "LOW":
        return "Low";
      case "LOW_MODERATE":
        return "Low-moderate";
      case "MODERATE":
        return "Moderate";
      case "HIGH":
        return "High";
      default:
        return stress;
    }
  }

  function getConfidenceLabel(conf) {
    switch (conf) {
      case "HIGH":
        return "High";
      case "LOW":
        return "Low";
      default:
        return conf;
    }
  }

  const chartData = {
    labels: breakdown.map((b) => b.horizonDays + " days"),
    datasets: [
      {
        label: "Supply (L)",
        data: breakdown.map((b) => b.supplyLitres),
        backgroundColor: colors.supply,
      },
      {
        label: "Demand (L)",
        data: breakdown.map((b) => b.demandLitres),
        backgroundColor: colors.demand,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: colors.text },
        grid: { color: colors.grid },
      },
      y: {
        ticks: { color: colors.text },
        grid: { color: colors.grid },
      },
    },
  };

  const suitability = assessment.suitability;
  const badgeColors = suitabilityBadge[suitability];
  const ratioValue = Number(assessment.ratio).toFixed(2);
  const stressLabel = getStressLabel(assessment.stress);
  const confidenceLabel = getConfidenceLabel(assessment.confidence);

  function handleDownloadCsv() {
    const csv = toCsv(report);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jalkrishi-assessment-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen app-bg p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link
            to="/"
            className="text-blue-700 font-semibold hover:text-sky-700 transition"
          >
            Back to dashboard
          </Link>
        </div>

        {/* Hero Card */}
        <Card className="fade-up">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink mb-2">
            Assessment result
          </h1>
          {assessment.createdAt && (
            <p className="text-muted text-sm mb-4">
              {new Date(assessment.createdAt).toLocaleDateString()}
            </p>
          )}

          <div className="flex flex-col items-center gap-4 mb-4">
            <RatioGauge ratio={assessment.ratio} className="w-[260px]" />
            <span
              style={{
                background: badgeColors.bg,
                color: badgeColors.fg,
              }}
              className="px-3 py-1 rounded-full text-sm font-semibold shadow"
            >
              {suitabilityLabel[suitability]}
            </span>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
                Ratio: {ratioValue}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
                Stress: {stressLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
                Confidence: {confidenceLabel}
              </span>
            </div>
          </div>

          {assessment.mlUsed && (
            <div className="text-sm text-muted mb-4">
              ML suggestion: {assessment.mlSuitability}
            </div>
          )}

          {/* What this means */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-ink mb-2">
              What this means
            </h2>
            <p className="text-muted text-sm mb-2">
              {assessment.ratio >= 1
                ? "The water available covers the full need of this crop for the period."
                : `About ${Math.round(assessment.ratio * 100)}% of the crop's water need is covered by the water available.`}
            </p>
            <p className="text-muted text-sm">
              {(() => {
                switch (suitability) {
                  case "EXCELLENT":
                    return "The water you have is enough for this crop over this period.";
                  case "GOOD":
                    return "The farm has 80 to 100 percent of the water this crop needs. Watch the dry weeks.";
                  case "RISKY":
                    return "The farm has 60 to 80 percent of the water this crop needs. Plan extra water or a shorter period.";
                  case "NOT_RECOMMENDED":
                    return "The farm has less than 60 percent of the water this crop needs. Consider another crop or more water.";
                  default:
                    return "";
                }
              })()}
            </p>
          </div>

          {/* Advice callout */}
          <div
            className="flex items-start gap-3 p-4 bg-primary-soft rounded-xl border border-primary/20"
            role="note"
          >
            <Lightbulb
              className="w-5 h-5 text-primary mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-sm text-ink">{assessment.advice}</p>
          </div>

          {/* Low confidence note */}
          {assessment.confidence === "LOW" && (
            <p className="mt-4 text-sm text-muted">
              Low confidence means typical weather values were used instead of
              live weather.
            </p>
          )}
        </Card>

        {/* Row of two cards: Water balance and Weather used */}
        <div className="flex flex-wrap gap-4 mt-4">
          {assessment.supplyLitres !== undefined &&
            assessment.demandLitres !== undefined &&
            assessment.balanceLitres !== undefined && (
              <Card className="fade-up flex-1 basis-72 min-w-[280px]">
                <h3 className="text-lg font-semibold text-ink mb-2">
                  Water balance
                </h3>
                <div className="space-y-1 text-sm">
                  <div>
                    Supply:{" "}
                    {Math.round(assessment.supplyLitres).toLocaleString(
                      "en-US",
                    )}{" "}
                    L
                  </div>
                  <div>
                    Demand:{" "}
                    {Math.round(assessment.demandLitres).toLocaleString(
                      "en-US",
                    )}{" "}
                    L
                  </div>
                  <div
                    className={
                      assessment.balanceLitres < 0
                        ? "text-danger"
                        : "text-primary"
                    }
                  >
                    Balance:{" "}
                    {Math.round(assessment.balanceLitres).toLocaleString(
                      "en-US",
                    )}{" "}
                    L
                  </div>
                </div>
              </Card>
            )}

          {assessment.weather && (
            <Card className="fade-up flex-1 basis-72 min-w-[280px]">
              <h3 className="text-lg font-semibold text-ink mb-2">
                Weather used
              </h3>
              <div className="space-y-1 text-sm text-muted">
                <div>Max temp: {assessment.weather.tmax.toFixed(1)} °C</div>
                <div>Min temp: {assessment.weather.tmin.toFixed(1)} °C</div>
                <div>
                  Rain per day: {assessment.weather.peffDailyMm.toFixed(1)} mm
                </div>
                <div>
                  Weather source:{" "}
                  {assessment.weather.source === "LIVE"
                    ? "Live"
                    : "Fallback (estimated)"}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Bar chart card */}
        <Card className="fade-up mt-4">
          <h3 className="text-lg font-semibold text-ink mb-4">
            Supply and demand by period
          </h3>
          <div
            role="img"
            aria-label="Bar chart of water supply and demand for 30, 60 and 90 days"
          >
            <Bar data={chartData} options={chartOptions} />
          </div>
        </Card>

        {/* Table card */}
        <Card className="fade-up mt-4">
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              aria-label="Water balance by period"
            >
              <thead>
                <tr className="text-left text-muted border-b border-white/20 dark:border-white/10">
                  <th className="pb-2 font-medium">Period</th>
                  <th className="pb-2 font-medium">Supply (L)</th>
                  <th className="pb-2 font-medium">Demand (L)</th>
                  <th className="pb-2 font-medium">Balance (L)</th>
                  <th className="pb-2 font-medium">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, idx) => {
                  const balance = row.supplyLitres - row.demandLitres;
                  const rowSuitability = row.suitability;
                  const rowBadgeColors = suitabilityBadge[rowSuitability];
                  const rowRatio = Number(row.ratio).toFixed(2);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-white/10 dark:border-white/5 last:border-0"
                    >
                      <td className="py-2 text-ink">{row.horizonDays} days</td>
                      <td className="py-2 text-ink tabular-nums">
                        {Math.round(row.supplyLitres).toLocaleString("en-US")}
                      </td>
                      <td className="py-2 text-ink tabular-nums">
                        {Math.round(row.demandLitres).toLocaleString("en-US")}
                      </td>
                      <td
                        className="py-2 tabular-nums"
                        style={{
                          color:
                            balance < 0
                              ? "var(--color-danger)"
                              : "var(--color-ink)",
                        }}
                      >
                        {Math.round(balance).toLocaleString("en-US")}
                      </td>
                      <td className="py-2">
                        <span
                          style={{
                            background: rowBadgeColors.bg,
                            color: rowBadgeColors.fg,
                          }}
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        >
                          {rowRatio}
                          <span className="sr-only">
                            Class: {suitabilityLabel[rowSuitability]}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions row */}
        <div className="no-print flex flex-wrap gap-3 mt-6">
          <Button variant="secondary" onClick={handleDownloadCsv}>
            <Download className="w-4 h-4" aria-hidden="true" />
            Download CSV
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4" aria-hidden="true" />
            Print or save as PDF
          </Button>
          <Link
            to="/assess"
            className="btn-ghost px-4 py-2 rounded-full text-sm font-semibold"
          >
            Run another assessment
          </Link>
          <Link
            to="/history"
            className="btn-ghost px-4 py-2 rounded-full text-sm font-semibold"
          >
            View history
          </Link>
          <Link
            to="/"
            className="btn-ghost px-4 py-2 rounded-full text-sm font-semibold"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
