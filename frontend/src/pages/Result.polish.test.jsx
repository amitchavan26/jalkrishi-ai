import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("Result polish", () => {
  const report = {
    assessment: {
      id: "a1",
      suitability: "RISKY",
      stress: "MODERATE",
      confidence: "LOW",
      ratio: 0.6543,
      advice: "RISKY: water ratio is 0.65, driven by low effective rainfall.",
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("showsPlainMeaning", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText(
      "About 65% of the crop's water need is covered by the water available.",
    );
    await screen.findByText(
      "The farm has 60 to 80 percent of the water this crop needs. Plan extra water or a shorter period.",
    );
  });

  it("showsPeriodTable", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    const table = await screen.findByRole("table", {
      name: "Water balance by period",
    });
    const rows = table.querySelectorAll("tr");
    expect(rows.length).toBe(4);

    const secondRow = rows[1];
    expect(secondRow).toHaveTextContent("30 days");
    expect(secondRow).toHaveTextContent("1,000");
    expect(secondRow).toHaveTextContent("1,500");
    expect(secondRow).toHaveTextContent("-500");
    expect(secondRow).toHaveTextContent("0.67");

    const lastRow = rows[3];
    expect(lastRow).toHaveTextContent("-2,000");
  });

  it("csvDownloadBuildsABlob", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    const downloadBtn = await screen.findByRole("button", {
      name: "Download CSV",
    });
    await userEvent.click(downloadBtn);

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = URL.createObjectURL.mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("printButtonCallsWindowPrint", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    window.print = vi.fn();

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    const printBtn = await screen.findByRole("button", {
      name: "Print or save as PDF",
    });
    await userEvent.click(printBtn);

    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("lowConfidenceNoteDependsOnConfidence", async () => {
    api.get.mockResolvedValueOnce({ data: report });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText(
      "Low confidence means typical weather values were used instead of live weather.",
    );
  });

  it("noLowConfidenceNoteWhenHigh", async () => {
    const highConfidenceReport = {
      ...report,
      assessment: {
        ...report.assessment,
        confidence: "HIGH",
      },
    };
    api.get.mockResolvedValueOnce({ data: highConfidenceReport });

    render(
      <MemoryRouter initialEntries={["/assessments/a1"]}>
        <Routes>
          <Route path="/assessments/:id" element={<Result />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole("table", { name: "Water balance by period" });
    expect(
      screen.queryByText(
        "Low confidence means typical weather values were used instead of live weather.",
      ),
    ).toBeNull();
  });
});
