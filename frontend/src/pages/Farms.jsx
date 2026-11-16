import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import FarmMap from "../components/FarmMap";
import { searchPlaces } from "../geocode";
import {
  acresToHa,
  bucketToPerDay,
  tankLitres,
  perDayFromTotal,
  haToAcres,
} from "../waterMath";
import { Card, Badge, Button, EmptyState, Skeleton } from "../components/ui";
import { useToast } from "../components/ui";

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const toast = useToast();

  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("ha");
  const [soilType, setSoilType] = useState("Loam");
  const [stored, setStored] = useState("0");
  const [storedUnit, setStoredUnit] = useState("perDay");
  const [ground, setGround] = useState("0");
  const [groundUnit, setGroundUnit] = useState("perDay");

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [village, setVillage] = useState("");

  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [focus, setFocus] = useState(null);

  const [pumpBucket, setPumpBucket] = useState("20");
  const [pumpSeconds, setPumpSeconds] = useState("");
  const [pumpHours, setPumpHours] = useState("4");
  const [tankLengthUnit, setTankLengthUnit] = useState("m");
  const [tankLength, setTankLength] = useState("");
  const [tankWidth, setTankWidth] = useState("");
  const [tankDepth, setTankDepth] = useState("");
  const [tankDays, setTankDays] = useState("60");

  const [areaDisplay, setAreaDisplay] = useState("ha");

  useEffect(() => {
    async function fetchFarms() {
      try {
        const res = await api.get("/api/farms");
        setFarms(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load farms");
      } finally {
        setLoading(false);
      }
    }
    fetchFarms();
  }, []);

  async function handleDelete(id) {
    try {
      await api.delete("/api/farms/" + id);
      setFarms(farms.filter((f) => f.id !== id));
      toast.success("Farm deleted");
    } catch (err) {
      // ignore or handle if needed
    }
  }

  async function handleSearch() {
    const c = country.trim();
    const s = state.trim();
    const d = district.trim();
    const t = taluka.trim();
    const v = village.trim();

    if (!c && !s && !d && !t && !v) {
      setSearchMessage("Enter at least a village, district or state.");
      return;
    }

    setSearching(true);
    setSearchMessage("");
    setSearchResults([]);

    try {
      const results = await searchPlaces({
        country: c,
        state: s,
        district: d,
        taluka: t,
        village: v,
      });
      if (results.length === 0) {
        setSearchMessage(
          "No place found. Try fewer fields, for example only village and district, or click the map.",
        );
      } else {
        setSearchMessage("Pick the best match:");
        setSearchResults(results);
      }
    } catch (err) {
      setSearchMessage(
        "Could not search places. Check your connection or click the map.",
      );
    } finally {
      setSearching(false);
    }
  }

  function handleResultClick(result) {
    setLat(Number(result.lat.toFixed(5)));
    setLon(Number(result.lon.toFixed(5)));
    setFocus({ lat: result.lat, lon: result.lon });
    setSearchResults([]);
    setSearchMessage("Location set. Click the map to adjust it.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const areaValue = area === "" ? 0 : Number(area);
      const areaHa = areaUnit === "acre" ? acresToHa(areaValue) : areaValue;

      const storedValue = stored === "" ? 0 : Number(stored);
      const groundValue = ground === "" ? 0 : Number(ground);

      const payload = {
        name,
        lat: Number(lat),
        lon: Number(lon),
        areaHa,
        soilType,
        storedWaterLitres: storedUnit === "total" ? storedValue : 0,
        groundwaterLitres: groundUnit === "total" ? groundValue : 0,
      };

      if (storedUnit === "perDay" && storedValue > 0) {
        payload.storedWaterLitresPerDay = storedValue;
      }
      if (groundUnit === "perDay" && groundValue > 0) {
        payload.groundwaterLitresPerDay = groundValue;
      }

      const c = country.trim();
      const s = state.trim();
      const d = district.trim();
      const t = taluka.trim();
      const v = village.trim();
      if (c) payload.country = c;
      if (s) payload.state = s;
      if (d) payload.district = d;
      if (t) payload.taluka = t;
      if (v) payload.village = v;

      const res = await api.post("/api/farms", payload);
      setFarms([...farms, res.data]);
      toast.success("Farm added");
      setName("");
      setLat("");
      setLon("");
      setArea("");
      setAreaUnit("ha");
      setSoilType("Loam");
      setStored("0");
      setStoredUnit("perDay");
      setGround("0");
      setGroundUnit("perDay");
      setCountry("");
      setState("");
      setDistrict("");
      setTaluka("");
      setVillage("");
      setFocus(null);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Could not save farm");
    } finally {
      setSaving(false);
    }
  }

  function handleMapPick(la, lo) {
    setLat(Number(la.toFixed(5)));
    setLon(Number(lo.toFixed(5)));
  }

  function formatLocation(farm) {
    const parts = [
      farm.village,
      farm.taluka,
      farm.district,
      farm.state,
      farm.country,
    ].filter(Boolean);
    return parts.join(", ");
  }

  const pumpResult = bucketToPerDay({
    bucketLitres: Number(pumpBucket),
    seconds: Number(pumpSeconds),
    hoursPerDay: Number(pumpHours),
  });

  const tankResult = tankLitres({
    length: Number(tankLength),
    width: Number(tankWidth),
    depth: Number(tankDepth),
    unit: tankLengthUnit,
  });

  const tankPerDay = tankResult
    ? perDayFromTotal(tankResult, Number(tankDays))
    : null;

  function handleUsePumpForGroundwater() {
    if (pumpResult) {
      setGroundUnit("perDay");
      setGround(String(pumpResult.litresPerDay));
    }
  }

  function handleUseTankForStored() {
    if (tankResult && tankPerDay) {
      if (storedUnit === "perDay") {
        setStored(String(tankPerDay));
      } else {
        setStored(String(tankResult));
      }
    }
  }

  const pumpHoursNum = pumpHours === "" ? 0 : Number(pumpHours);
  const tankDaysNum = tankDays === "" ? 0 : Number(tankDays);

  return (
    <div className="min-h-screen app-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Link
            to="/"
            className="text-primary hover:text-primary/80 font-semibold transition"
          >
            Back to dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold text-ink mb-6">Your farms</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div
              role="group"
              aria-label="Area display"
              className="flex gap-2 mb-4"
            >
              <Button
                variant={areaDisplay === "ha" ? "primary" : "ghost"}
                onClick={() => setAreaDisplay("ha")}
                aria-pressed={areaDisplay === "ha"}
              >
                Hectares
              </Button>
              <Button
                variant={areaDisplay === "acre" ? "primary" : "ghost"}
                onClick={() => setAreaDisplay("acre")}
                aria-pressed={areaDisplay === "acre"}
              >
                Acres
              </Button>
            </div>

            {loading && (
              <div role="status" aria-live="polite">
                <span className="sr-only">Loading farms...</span>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-4"
              >
                {error}
              </div>
            )}

            {!loading && !error && farms.length === 0 && (
              <EmptyState
                title="No farms yet."
                text="Pick a place on the map or search it by name, then add your water."
                icon={() => (
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                )}
              />
            )}

            {!loading && !error && farms.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {farms.map((farm, index) => (
                  <article
                    key={farm.id}
                    aria-label={farm.name}
                    className="fade-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <Card hover>
                      <h2 className="text-xl font-semibold text-ink mb-2">
                        {farm.name}
                      </h2>
                      <Badge tone="info" className="mb-3">
                        {farm.soilType}
                      </Badge>
                      {formatLocation(farm) && (
                        <p className="text-sm text-muted mb-3">
                          {formatLocation(farm)}
                        </p>
                      )}
                      <div className="text-2xl font-extrabold tabular-nums text-ink mb-3">
                        {areaDisplay === "ha"
                          ? `${farm.areaHa} ha`
                          : `${haToAcres(farm.areaHa)} acres`}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(farm.storedWaterLitresPerDay || 0) > 0 && (
                          <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-xs">
                            Stored water{" "}
                            {(farm.storedWaterLitresPerDay || 0).toLocaleString(
                              "en-US",
                            )}{" "}
                            L/day
                          </span>
                        )}
                        {(farm.storedWaterLitres || 0) > 0 && (
                          <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-xs">
                            Stored water{" "}
                            {(farm.storedWaterLitres || 0).toLocaleString(
                              "en-US",
                            )}{" "}
                            L total
                          </span>
                        )}
                        {(farm.groundwaterLitresPerDay || 0) > 0 && (
                          <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-xs">
                            Groundwater{" "}
                            {(farm.groundwaterLitresPerDay || 0).toLocaleString(
                              "en-US",
                            )}{" "}
                            L/day
                          </span>
                        )}
                        {(farm.groundwaterLitres || 0) > 0 && (
                          <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-xs">
                            Groundwater{" "}
                            {(farm.groundwaterLitres || 0).toLocaleString(
                              "en-US",
                            )}{" "}
                            L total
                          </span>
                        )}
                      </div>
                      {typeof farm.lat === "number" &&
                        typeof farm.lon === "number" && (
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${farm.lat}&mlon=${farm.lon}#map=14/${farm.lat}/${farm.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm font-medium"
                            aria-label={`Open ${farm.name} in OpenStreetMap`}
                          >
                            Open map
                          </a>
                        )}
                      <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(farm.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <Card>
              <div className="glass p-4 mb-4">
                <h3 className="text-lg font-medium mb-3">Find by place name</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="loc-country"
                      className="block text-sm font-medium text-muted"
                    >
                      Country
                    </label>
                    <input
                      id="loc-country"
                      type="text"
                      placeholder="India"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="loc-state"
                      className="block text-sm font-medium text-muted"
                    >
                      State
                    </label>
                    <input
                      id="loc-state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="loc-district"
                      className="block text-sm font-medium text-muted"
                    >
                      District
                    </label>
                    <input
                      id="loc-district"
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="loc-taluka"
                      className="block text-sm font-medium text-muted"
                    >
                      Taluka
                    </label>
                    <input
                      id="loc-taluka"
                      type="text"
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="loc-village"
                      className="block text-sm font-medium text-muted"
                    >
                      Village
                    </label>
                    <input
                      id="loc-village"
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="w-full mb-3"
                >
                  {searching ? "Searching..." : "Find location"}
                </Button>
                {searchMessage && (
                  <div className="text-sm text-muted">{searchMessage}</div>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left p-2 rounded hover:bg-primary-soft transition"
                      >
                        {result.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4 rounded-xl overflow-hidden">
                <FarmMap
                  lat={lat === "" ? NaN : Number(lat)}
                  lon={lon === "" ? NaN : Number(lon)}
                  onPick={handleMapPick}
                  focus={focus}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="farm-name"
                    className="block text-sm font-medium text-muted"
                  >
                    Name
                  </label>
                  <input
                    id="farm-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-glass"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="farm-lat"
                      className="block text-sm font-medium text-muted"
                    >
                      Latitude
                    </label>
                    <input
                      id="farm-lat"
                      type="number"
                      step="any"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="farm-lon"
                      className="block text-sm font-medium text-muted"
                    >
                      Longitude
                    </label>
                    <input
                      id="farm-lon"
                      type="number"
                      step="any"
                      required
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="farm-area-unit"
                    className="block text-sm font-medium text-muted"
                  >
                    Area unit
                  </label>
                  <select
                    id="farm-area-unit"
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value)}
                    className="input-glass"
                  >
                    <option value="ha">Hectares</option>
                    <option value="acre">Acres</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="farm-area"
                    className="block text-sm font-medium text-muted"
                  >
                    Area ({areaUnit === "ha" ? "ha" : "acre"})
                  </label>
                  <input
                    id="farm-area"
                    type="number"
                    step="any"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="input-glass"
                  />
                  {areaUnit === "acre" && area !== "" && Number(area) > 0 && (
                    <div className="text-sm text-muted mt-1">
                      = {acresToHa(Number(area))} ha
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="farm-soil"
                    className="block text-sm font-medium text-muted"
                  >
                    Soil type
                  </label>
                  <select
                    id="farm-soil"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="input-glass"
                  >
                    <option value="Sandy">Sandy</option>
                    <option value="Loam">Loam</option>
                    <option value="Clay">Clay</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="farm-stored-unit"
                      className="block text-sm font-medium text-muted"
                    >
                      Stored water unit
                    </label>
                    <select
                      id="farm-stored-unit"
                      value={storedUnit}
                      onChange={(e) => setStoredUnit(e.target.value)}
                      className="input-glass"
                    >
                      <option value="perDay">litres per day</option>
                      <option value="total">litres in total</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="farm-ground-unit"
                      className="block text-sm font-medium text-muted"
                    >
                      Groundwater unit
                    </label>
                    <select
                      id="farm-ground-unit"
                      value={groundUnit}
                      onChange={(e) => setGroundUnit(e.target.value)}
                      className="input-glass"
                    >
                      <option value="perDay">litres per day</option>
                      <option value="total">litres in total</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="farm-stored"
                      className="block text-sm font-medium text-muted"
                    >
                      Stored water (
                      {storedUnit === "perDay"
                        ? "litres per day"
                        : "litres in total"}
                      )
                    </label>
                    <input
                      id="farm-stored"
                      type="number"
                      step="any"
                      value={stored}
                      onChange={(e) => setStored(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="farm-ground"
                      className="block text-sm font-medium text-muted"
                    >
                      Groundwater (
                      {groundUnit === "perDay"
                        ? "litres per day"
                        : "litres in total"}
                      )
                    </label>
                    <input
                      id="farm-ground"
                      type="number"
                      step="any"
                      value={ground}
                      onChange={(e) => setGround(e.target.value)}
                      className="input-glass"
                    />
                  </div>
                </div>

                <details className="glass p-4 mt-4">
                  <summary className="cursor-pointer font-medium text-ink">
                    Help me calculate water
                  </summary>
                  <div className="mt-4 space-y-6">
                    <div className="glass p-4">
                      <h4 className="font-medium mb-3 text-ink">
                        Pump or borewell
                      </h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label
                            htmlFor="pump-bucket"
                            className="block text-sm font-medium text-muted"
                          >
                            Bucket size (litres)
                          </label>
                          <input
                            id="pump-bucket"
                            type="number"
                            step="any"
                            value={pumpBucket}
                            onChange={(e) => setPumpBucket(e.target.value)}
                            className="input-glass"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="pump-seconds"
                            className="block text-sm font-medium text-muted"
                          >
                            Seconds to fill the bucket
                          </label>
                          <input
                            id="pump-seconds"
                            type="number"
                            step="any"
                            value={pumpSeconds}
                            onChange={(e) => setPumpSeconds(e.target.value)}
                            className="input-glass"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="pump-hours"
                            className="block text-sm font-medium text-muted"
                          >
                            Pump hours per day
                          </label>
                          <input
                            id="pump-hours"
                            type="number"
                            step="any"
                            value={pumpHours}
                            onChange={(e) => setPumpHours(e.target.value)}
                            className="input-glass"
                          />
                          <input
                            type="range"
                            min="0"
                            max="24"
                            step="0.5"
                            aria-label="Pump hours per day slider"
                            value={pumpHours === "" ? 0 : pumpHoursNum}
                            onChange={(e) =>
                              setPumpHours(String(e.target.value))
                            }
                            className="w-full accent-[var(--primary)] mt-2"
                          />
                        </div>
                      </div>
                      {pumpResult && (
                        <div className="space-y-1 mb-4">
                          <div className="text-sm text-ink">
                            {pumpResult.litresPerMinute.toFixed(1)} litres per
                            minute
                          </div>
                          <div className="text-sm text-ink">
                            {pumpResult.litresPerDay.toLocaleString("en-US")}{" "}
                            litres per day
                          </div>
                        </div>
                      )}
                      {pumpHoursNum > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted mb-4">
                          <span>
                            Pump runs {pumpHoursNum} of 24 hours a day
                          </span>
                          <svg
                            aria-hidden="true"
                            className="w-10 h-5 flex-shrink-0"
                            viewBox="0 0 40 20"
                          >
                            <rect
                              x="2"
                              y="2"
                              width="36"
                              height="16"
                              rx="2"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <rect
                              x="3"
                              y={3 + 14 * (1 - pumpHoursNum / 24)}
                              width="34"
                              height={14 * (pumpHoursNum / 24)}
                              rx="1.5"
                              fill="var(--primary)"
                              style={{
                                transition: "height 0.3s ease",
                              }}
                            />
                          </svg>
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={handleUsePumpForGroundwater}
                        disabled={!pumpResult}
                        variant="ghost"
                        className="w-full"
                      >
                        Use for groundwater
                      </Button>
                    </div>

                    <div className="glass p-4">
                      <h4 className="font-medium mb-3 text-ink">
                        Tank or farm pond
                      </h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label
                            htmlFor="tank-length-unit"
                            className="block text-sm font-medium text-muted"
                          >
                            Length unit
                          </label>
                          <select
                            id="tank-length-unit"
                            value={tankLengthUnit}
                            onChange={(e) => setTankLengthUnit(e.target.value)}
                            className="input-glass"
                          >
                            <option value="m">Metres</option>
                            <option value="ft">Feet</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="tank-length"
                            className="block text-sm font-medium text-muted"
                          >
                            Length
                          </label>
                          <input
                            id="tank-length"
                            type="number"
                            step="any"
                            value={tankLength}
                            onChange={(e) => setTankLength(e.target.value)}
                            className="input-glass"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="tank-width"
                            className="block text-sm font-medium text-muted"
                          >
                            Width
                          </label>
                          <input
                            id="tank-width"
                            type="number"
                            step="any"
                            value={tankWidth}
                            onChange={(e) => setTankWidth(e.target.value)}
                            className="input-glass"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="tank-depth"
                            className="block text-sm font-medium text-muted"
                          >
                            Average water depth
                          </label>
                          <input
                            id="tank-depth"
                            type="number"
                            step="any"
                            value={tankDepth}
                            onChange={(e) => setTankDepth(e.target.value)}
                            className="input-glass"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="tank-days"
                            className="block text-sm font-medium text-muted"
                          >
                            Days the water should last
                          </label>
                          <input
                            id="tank-days"
                            type="number"
                            step="any"
                            value={tankDays}
                            onChange={(e) => setTankDays(e.target.value)}
                            className="input-glass"
                          />
                          <input
                            type="range"
                            min="7"
                            max="180"
                            step="1"
                            aria-label="Days the water should last slider"
                            value={tankDays === "" ? 7 : tankDaysNum}
                            onChange={(e) =>
                              setTankDays(String(e.target.value))
                            }
                            className="w-full accent-[var(--primary)] mt-2"
                          />
                        </div>
                      </div>
                      {tankResult && (
                        <div className="space-y-1 mb-4">
                          <div className="text-sm text-ink">
                            {tankResult.toLocaleString("en-US")} litres in total
                          </div>
                          {tankPerDay && (
                            <div className="text-sm text-ink">
                              {tankPerDay.toLocaleString("en-US")} litres per
                              day
                            </div>
                          )}
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={handleUseTankForStored}
                        disabled={!tankResult || !tankPerDay}
                        variant="ghost"
                        className="w-full"
                      >
                        Use for stored water
                      </Button>
                    </div>
                  </div>
                </details>

                <Button type="submit" disabled={saving} className="w-full">
                  Add farm
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
