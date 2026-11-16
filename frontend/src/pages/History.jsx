import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { suitabilityLabel, suitabilityBadge } from "../labels";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ChevronsUpDown } from "lucide-react";

export default function History() {
  const [assessments, setAssessments] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending",
  });
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const [assessmentsRes, farmsRes, cropsRes] = await Promise.all([
          api.get("/api/assessments"),
          api.get("/api/farms"),
          api.get("/api/crops"),
        ]);
        setAssessments(assessmentsRes.data);
        setFarms(farmsRes.data);
        setCrops(cropsRes.data);
      } catch (err) {
        setError("Could not load history");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return assessments;
    return assessments.filter((a) => a.suitability === filter);
  }, [assessments, filter]);

  const sorted = useMemo(() => {
    const { key, direction } = sortConfig;
    return [...filtered].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      if (key === "ratio" || key === "horizonDays") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (key === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  const total = sorted.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const paged = sorted.slice(start, end);

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
    setPage(1);
  }

  function handleFilterChange(e) {
    setFilter(e.target.value);
    setPage(1);
  }

  function handleClearFilter() {
    setFilter("");
    setPage(1);
  }

  if (loading) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading history...</span>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
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

  if (assessments.length === 0) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            icon={() => (
              <svg
                aria-hidden="true"
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
            title="No assessments yet."
            text=""
            action={
              <Link
                to="/assess"
                className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-primary text-primary-ink shadow-lg px-5 py-2.5 text-sm"
              >
                Assess a crop
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const filterOptions = [
    { value: "", label: "All classes" },
    { value: "EXCELLENT", label: "Only Excellent" },
    { value: "GOOD", label: "Only Good" },
    { value: "RISKY", label: "Only Risky" },
    { value: "NOT_RECOMMENDED", label: "Only Not recommended" },
  ];

  return (
    <div className="min-h-screen app-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-ink">
          Assessment history
        </h1>

        <Card className="fade-up mb-6">
          <label htmlFor="suitability-filter" className="sr-only">
            Filter by suitability
          </label>
          <select
            id="suitability-filter"
            aria-label="Filter by suitability"
            value={filter}
            onChange={handleFilterChange}
            className="input-glass w-auto"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Card>

        {filtered.length === 0 && filter && (
          <div className="text-center text-muted py-8">
            <p className="mb-2">No assessments match this filter.</p>
            <Button variant="ghost" size="sm" onClick={handleClearFilter}>
              Clear filter
            </Button>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <Card className="fade-up">
              <div className="max-h-[70vh] overflow-auto">
                <table className="min-w-full divide-y divide-white/10 dark:divide-white/10">
                  <thead className="sticky top-0 bg-surface backdrop-blur">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleSort("createdAt")}
                          className="flex items-center gap-1 hover:text-ink transition"
                          aria-sort={
                            sortConfig.key === "createdAt"
                              ? sortConfig.direction
                              : "none"
                          }
                        >
                          Date
                          <ChevronsUpDown
                            className="w-4 h-4"
                            aria-hidden="true"
                          />
                        </button>
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2 px-4 py-2">
                        Farm
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2 px-4 py-2">
                        Crop
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleSort("horizonDays")}
                          className="flex items-center gap-1 hover:text-ink transition"
                          aria-sort={
                            sortConfig.key === "horizonDays"
                              ? sortConfig.direction
                              : "none"
                          }
                        >
                          Horizon
                          <ChevronsUpDown
                            className="w-4 h-4"
                            aria-hidden="true"
                          />
                        </button>
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleSort("ratio")}
                          className="flex items-center gap-1 hover:text-ink transition"
                          aria-sort={
                            sortConfig.key === "ratio"
                              ? sortConfig.direction
                              : "none"
                          }
                        >
                          Ratio
                          <ChevronsUpDown
                            className="w-4 h-4"
                            aria-hidden="true"
                          />
                        </button>
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2 px-4 py-2">
                        Suitability
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2 px-4 py-2">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/10">
                    {paged.map((assessment) => {
                      const farmName =
                        farms.find((f) => f.id === assessment.farmId)?.name ||
                        assessment.farmId;
                      const cropName =
                        crops.find((c) => c.id === assessment.cropId)?.name ||
                        assessment.cropId;
                      return (
                        <tr
                          key={assessment.id}
                          className="hover:bg-white/5 dark:hover:bg-white/5 transition"
                        >
                          <td className="px-4 py-2 text-sm text-ink">
                            {new Date(
                              assessment.createdAt,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-ink">
                            {farmName}
                          </td>
                          <td className="px-4 py-2 text-sm text-ink">
                            {cropName}
                          </td>
                          <td className="px-4 py-2 text-sm text-ink tabular-nums">
                            {assessment.horizonDays} days
                          </td>
                          <td className="px-4 py-2 text-sm text-ink tabular-nums">
                            {Number(assessment.ratio).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <Badge
                              style={{
                                background:
                                  suitabilityBadge[assessment.suitability].bg,
                                color:
                                  suitabilityBadge[assessment.suitability].fg,
                              }}
                            >
                              {suitabilityLabel[assessment.suitability] ||
                                assessment.suitability}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <Link
                              to={"/assessments/" + assessment.id}
                              className="text-primary font-semibold hover:text-primary/80 transition"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 dark:border-white/10">
                <p className="text-sm text-muted">
                  Showing {start + 1} to {end} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous page
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next page
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
