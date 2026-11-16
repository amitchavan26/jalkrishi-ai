import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Result from "./Result";
import { api } from "../api";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }) => <div data-testid="chart">{data.labels.join(",")}</div>,
}));

describe("Result page", () => {
  const report = {
    assessment: {
      id: "a1",
      suitability: "RISKY",
      stress: "MODERATE",
      confidence: "LOW",
      ratio: 0.6543,
      advice: "ok",
      mlUsed: false,
      mlSuitability: null,
    },
    breakdown: [
      {
        horizonDays: 30,
        supplyLitres: 1000,
        demandLitres: 1500,
        ratio: 0.67,
        suitability: "RISKY",
      },
      {
        horizonDays: 60,
        supplyLitres: 2000,
        demandLitres: 3200,
        ratio: 0.63,
        suitability: "RISKY",
      },
      {
        horizonDays: 90,
        supplyLitres: 3000,
        demandLitres: 5000,
        ratio: 0.6,
        suitability: "RISKY",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("showsBadgeAndNumbers", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Risky")).toBeInTheDocument();
    expect(screen.getByText("Ratio: 0.65")).toBeInTheDocument();
    expect(screen.getByText("Stress: Moderate")).toBeInTheDocument();
    expect(screen.getByText("Confidence: Low")).toBeInTheDocument();
    expect(screen.getByText(report.assessment.advice)).toBeInTheDocument();
  });

  it("rendersChartWithThreeHorizons", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    const chart = await screen.findByTestId("chart");
    expect(chart).toHaveTextContent("30 days,60 days,90 days");
  });

  it("showsErrorWhenNotFound", async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { message: "Assessment not found" } },
    });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Assessment not found")).toBeInTheDocument();
  });
});

describe("Result details", () => {
  const report = {
    assessment: {
      id: "a1",
      suitability: "RISKY",
      stress: "MODERATE",
      confidence: "LOW",
      ratio: 0.6543,
      advice: "ok",
      mlUsed: false,
      mlSuitability: null,
      supplyLitres: 1000,
      demandLitres: 1500,
      balanceLitres: -500,
      weather: {
        tmax: 32,
        tmin: 21,
        ra: 15,
        peffDailyMm: 1.5,
        source: "FALLBACK",
      },
    },
    breakdown: [
      {
        horizonDays: 30,
        supplyLitres: 1000,
        demandLitres: 1500,
        ratio: 0.67,
        suitability: "RISKY",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("showsWaterBalance", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Supply: 1,000 L")).toBeInTheDocument();
    expect(screen.getByText("Demand: 1,500 L")).toBeInTheDocument();
    expect(screen.getByText("Balance: -500 L")).toBeInTheDocument();
  });

  it("showsWeatherCard", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Max temp: 32.0 °C")).toBeInTheDocument();
    expect(screen.getByText("Min temp: 21.0 °C")).toBeInTheDocument();
    expect(screen.getByText("Rain per day: 1.5 mm")).toBeInTheDocument();
    expect(
      screen.getByText("Weather source: Fallback (estimated)"),
    ).toBeInTheDocument();
  });
});
