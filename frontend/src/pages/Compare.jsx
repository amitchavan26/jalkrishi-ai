import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import {
  suitabilityLabel,
  stressLabel,
  suitabilityColor,
  suitabilityBadge,
} from "../labels";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Select } from "../components/ui/Input";
import { useTheme } from "../theme/ThemeProvider";
import { chartColors } from "../chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Compare() {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareError, setCompareError] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [results, setResults] = useState([]);

  const [farmId, setFarmId] = useState("");
  const [checkedCropIds, setCheckedCropIds] = useState([]);
  const [horizon, setHorizon] = useState("30");

  const { theme } = useTheme();
  const colors = chartColors(theme);

  const winnerIndex = useMemo(() => {
    if (results.length === 0) return -1;
    let maxRatio = -Infinity;
    let idx = 0;
    results.forEach((r, i) => {
      if (r.ratio > maxRatio) {
        maxRatio = r.ratio;
        idx = i;
      }
    });
    return idx;
  }, [results]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [farmsRes, cropsRes] = await Promise.all([
          api.get("/api/farms"),
          api.get("/api/crops"),
        ]);
        setFarms(farmsRes.data);
        setCrops(cropsRes.data);
        if (farmsRes.data.length > 0) setFarmId(farmsRes.data[0].id);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setCompareLoading(true);
    setCompareError(null);
    setResults([]);
    try {
      const res = await api.post("/api/assessments/compare", {
        farmId,
        cropIds: checkedCropIds,
        horizonDays: Number(horizon),
      });
      setResults(res.data);
    } catch (err) {
      setCompareError(err.response?.data?.message || "Could not compare crops");
    } finally {
      setCompareLoading(false);
    }
  }

  function handleSelectAll() {
    setCheckedCropIds(crops.map((c) => c.id));
  }

  function handleClearSelection() {
    setCheckedCropIds([]);
  }

  const noCropsChecked = checkedCropIds.length === 0;

  if (loading) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading...</span>
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
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

  if (farms.length === 0) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-md mx-auto">
            <p className="text-muted mb-4">Add a farm first.</p>
            <Link
              to="/farms"
              className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none bg-primary text-primary-ink shadow-lg px-5 py-2.5 text-sm"
            >
              Go to farms
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const farmOptions = farms.map((f) => ({ value: f.id, label: f.name }));
  const horizonOptions = [
    { value: "30", label: "30" },
    { value: "60", label: "60" },
    { value: "90", label: "90" },
  ];

  return (
    <div className="min-h-screen app-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-ink">
          Compare crops for your farm
        </h1>

        {compareError && (
          <div
            role="alert"
            className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-4"
          >
            {compareError}
          </div>
        )}

        <Card className="fade-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Farm"
              id="compare-farm"
              options={farmOptions}
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Crops
              </label>
              <div className="flex flex-wrap gap-2">
                {crops.map((crop) => (
                  <label
                    key={crop.id}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-primary-soft cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={checkedCropIds.includes(crop.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedCropIds([...checkedCropIds, crop.id]);
                        } else {
                          setCheckedCropIds(
                            checkedCropIds.filter((id) => id !== crop.id),
                          );
                        }
                      }}
                      className="accent-[var(--primary)]"
                    />
                    <span className="text-sm text-ink">{crop.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  Select all crops
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear selection
                </Button>
              </div>
            </div>

            <Select
              label="Horizon (days)"
              id="compare-horizon"
              options={horizonOptions}
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              required
            />

            <Button
              type="submit"
              loading={compareLoading}
              disabled={noCropsChecked}
            >
              Compare crops
            </Button>
          </form>
        </Card>

        {results.length > 0 && (
          <>
            <div
              aria-hidden="true"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6"
            >
              {results.map((result, index) => {
                const crop = crops.find((c) => c.id === result.cropId);
                const cropName = crop?.name || result.cropId;
                const isWinner = index === winnerIndex;
                const suit = result.suitability;
                const ratio = Number(result.ratio);
                const barWidth = ((Math.min(ratio, 1.5) / 1.5) * 100).toFixed(
                  1,
                );
                const badgeText =
                  suit === "NOT_RECOMMENDED" ? "Highest ratio" : "Best choice";
                const badgeTone =
                  suit === "NOT_RECOMMENDED" ? "warning" : "success";

                return (
                  <Card
                    key={result.cropId}
                    className="fade-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-ink">
                        {cropName}
                      </h3>
                      <div className="text-3xl font-extrabold tabular-nums text-ink">
                        {ratio.toFixed(2)}
                      </div>
                      <Badge
                        style={{
                          background: suitabilityBadge[suit].bg,
                          color: suitabilityBadge[suit].fg,
                        }}
                      >
                        {suitabilityLabel[suit] || suit}
                      </Badge>
                      <p className="text-sm text-muted">
                        {stressLabel[result.stress] || result.stress}
                      </p>
                      <div className="relative h-3 rounded-full bg-black/10 dark:bg-white/10">
                        <div
                          data-testid={`ratio-bar-${result.cropId}`}
                          style={{
                            width: `${barWidth}%`,
                            background: suitabilityColor[suit],
                          }}
                          className="h-3 rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                        />
                        <div
                          className="absolute top-0 bottom-0 w-[2px] bg-ink/60"
                          style={{ left: "66.7%" }}
                          aria-hidden="true"
                        />
                      </div>
                      {isWinner && (
                        <Badge tone={badgeTone} className="mt-2">
                          {badgeText}
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="fade-up mt-6">
              <div
                role="img"
                aria-label="Bar chart comparing the water ratio of the selected crops"
                className="p-4"
              >
                <Bar
                  data={{
                    labels: results.map(
                      (r) =>
                        crops.find((c) => c.id === r.cropId)?.name || r.cropId,
                    ),
                    datasets: [
                      {
                        label: "Ratio",
                        data: results.map((r) => r.ratio),
                        backgroundColor: results.map(
                          (r) => suitabilityColor[r.suitability],
                        ),
                      },
                    ],
                  }}
                  options={{
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          color: colors.grid,
                        },
                        ticks: {
                          color: colors.text,
                        },
                      },
                      y: {
                        grid: {
                          color: colors.grid,
                        },
                        ticks: {
                          color: colors.text,
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card>

            <Card className="fade-up mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 dark:divide-white/10">
                  <thead className="sticky top-0 bg-surface backdrop-blur">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2">
                        Crop
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2">
                        Ratio
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2">
                        Suitability
                      </th>
                      <th className="text-left text-xs uppercase tracking-widest text-muted pb-2">
                        Stress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/10">
                    {results.map((result) => {
                      const cropName =
                        crops.find((c) => c.id === result.cropId)?.name ||
                        result.cropId;
                      return (
                        <tr
                          key={result.cropId}
                          className="hover:bg-white/5 dark:hover:bg-white/5 transition"
                        >
                          <td className="px-4 py-2 text-sm text-ink">
                            {cropName}
                          </td>
                          <td className="px-4 py-2 text-sm text-ink tabular-nums">
                            {Number(result.ratio).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-ink">
                            <span
                              style={{
                                background:
                                  suitabilityBadge[result.suitability].bg,
                                color: suitabilityBadge[result.suitability].fg,
                              }}
                              className="px-3 py-1 rounded-full text-sm font-semibold shadow"
                            >
                              {suitabilityLabel[result.suitability] ||
                                result.suitability}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-muted">
                            {stressLabel[result.stress] || result.stress}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
