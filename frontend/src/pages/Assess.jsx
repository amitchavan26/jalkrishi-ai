import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { api } from "../api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { locationLine, waterChips } from "../farmInfo";

export default function Assess() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [step, setStep] = useState(1);
  const [farmId, setFarmId] = useState("");
  const [cropId, setCropId] = useState("");
  const [horizon, setHorizon] = useState("30");

  const headingRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [step]);

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
        if (cropsRes.data.length > 0) setCropId(cropsRes.data[0].id);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const selectedFarm = farms.find((f) => f.id === farmId);
  const selectedCrop = crops.find((c) => c.id === cropId);

  async function handleRun() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await api.post("/api/assessments", {
        farmId,
        cropId,
        horizonDays: Number(horizon),
      });
      navigate("/assessments/" + res.data.id);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Could not run assessment");
    } finally {
      setSaving(false);
    }
  }

  const steps = [
    { label: "Farm", number: 1 },
    { label: "Crop and period", number: 2 },
    { label: "Review", number: 3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-2xl mx-auto" role="status">
          <span className="sr-only">Loading...</span>
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-64 w-full" />
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
        </div>
      </div>
    );
  }

  if (farms.length === 0) {
    return (
      <div className="min-h-screen app-bg p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="fade-up">
            <p className="text-muted mb-4">Add a farm first.</p>
            <Link to="/farms" className="btn">
              Go to farms
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">
          New assessment
        </h1>

        <ol aria-label="Assessment steps" className="flex flex-wrap gap-2 mb-6">
          {steps.map((s) => (
            <li
              key={s.number}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                s.number < step
                  ? "bg-primary text-primary-ink"
                  : s.number === step
                    ? "bg-surface text-ink ring-2 ring-primary"
                    : "bg-surface text-muted"
              }`}
              aria-current={s.number === step ? "step" : undefined}
            >
              {s.number < step && (
                <Check className="w-4 h-4" aria-hidden="true" />
              )}
              {s.number >= step && (
                <span className="w-5 h-5 flex items-center justify-center">
                  {s.number}
                </span>
              )}
              {s.label}
            </li>
          ))}
        </ol>

        <Card className="fade-up">
          {step === 1 && (
            <>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-xl font-bold mb-4"
              >
                Choose a farm
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="assess-farm"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  Farm
                </label>
                <select
                  id="assess-farm"
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  required
                  className="input-glass"
                >
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedFarm && (
                <div data-testid="farm-summary" className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-ink">
                      {selectedFarm.areaHa} ha
                    </span>
                    <Badge tone="neutral">{selectedFarm.soilType}</Badge>
                  </div>
                  {locationLine(selectedFarm) && (
                    <p className="text-sm text-muted">
                      {locationLine(selectedFarm)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {waterChips(selectedFarm).length > 0 ? (
                      waterChips(selectedFarm).map((chip, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-primary-soft text-primary"
                        >
                          {chip}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted">
                        No water entered for this farm.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button type="button" onClick={() => setStep(2)}>
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-xl font-bold mb-4"
              >
                Choose a crop and a period
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="assess-crop"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  Crop
                </label>
                <select
                  id="assess-crop"
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  required
                  className="input-glass"
                  disabled={crops.length === 0}
                >
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCrop &&
                selectedCrop.stages &&
                selectedCrop.stages.length > 0 && (
                  <p className="text-sm text-muted mb-4">
                    {selectedCrop.stages.length} growth stage
                    {selectedCrop.stages.length !== 1 ? "s" : ""},{" "}
                    {selectedCrop.stages.reduce(
                      (sum, s) => sum + (s.days || 0),
                      0,
                    )}{" "}
                    days in total
                  </p>
                )}
              <div className="mb-4">
                <label
                  htmlFor="assess-horizon"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  Horizon (days)
                </label>
                <select
                  id="assess-horizon"
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                  required
                  className="input-glass"
                >
                  <option value="30">30</option>
                  <option value="60">60</option>
                  <option value="90">90</option>
                </select>
              </div>
              {crops.length === 0 && (
                <p className="text-sm text-muted mb-4">No crops available.</p>
              )}
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={crops.length === 0}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-xl font-bold mb-4"
              >
                Review and run
              </h2>
              <div data-testid="review" className="space-y-3 mb-4">
                <dl className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <dt className="text-sm text-muted">Farm</dt>
                    <dd className="text-sm text-ink font-medium">
                      {selectedFarm?.name}
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <dt className="text-sm text-muted">Area</dt>
                    <dd className="text-sm text-ink">
                      {selectedFarm?.areaHa} ha
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <dt className="text-sm text-muted">Crop</dt>
                    <dd className="text-sm text-ink font-medium">
                      {selectedCrop?.name}
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <dt className="text-sm text-muted">Period</dt>
                    <dd className="text-sm text-ink">{horizon} days</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <dt className="text-sm text-muted">Water on this farm</dt>
                    <dd className="text-sm text-ink">
                      {waterChips(selectedFarm).length > 0
                        ? waterChips(selectedFarm).join(", ")
                        : "None entered"}
                    </dd>
                  </div>
                </dl>
                <p className="text-sm text-muted">
                  The result uses live weather when it is available and typical
                  values when it is not.
                </p>
              </div>
              {saveError && (
                <div
                  className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-4"
                  role="alert"
                >
                  {saveError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleRun}
                  loading={saving}
                  disabled={saving}
                >
                  Run assessment
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
