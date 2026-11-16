import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Assess from "./Assess";
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

describe("Assess page", () => {
  let farms;
  let crops;
  beforeEach(() => {
    vi.clearAllMocks();
    farms = [
      {
        id: "f1",
        name: "North Field",
        areaHa: 2.5,
        soilType: "Loam",
        storedWaterLitres: 100000,
        groundwaterLitresPerDay: 20000,
      },
      { id: "f2", name: "South Field", areaHa: 1, soilType: "Clay" },
    ];
    crops = [
      {
        id: "c1",
        name: "Rice",
        stages: [
          { name: "Initial", days: 30, kc: 1.05 },
          { name: "Mid", days: 60, kc: 1.2 },
        ],
      },
      { id: "c2", name: "Wheat" },
    ];
    api.get.mockImplementation((url) =>
      Promise.resolve({
        data: url === "/api/farms" ? farms : crops,
      }),
    );
  });

  function renderAssess() {
    return render(
      <MemoryRouter initialEntries={["/assess"]}>
        <Routes>
          <Route path="/assess" element={<Assess />} />
          <Route path="/assessments/:id" element={<div>Result page</div>} />
          <Route path="/farms" element={<div>Farms page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("showsFirstStepWithFarms", async () => {
    renderAssess();
    await screen.findByRole("option", { name: "North Field" });
    expect(screen.getByText("Choose a farm")).toBeInTheDocument();
    const stepper = screen.getByRole("list", { name: "Assessment steps" });
    const currentStep = within(stepper).getByText("Farm").closest("li");
    expect(currentStep).toHaveAttribute("aria-current", "step");
  });
  it("showsFarmSummary", async () => {
    renderAssess();
    const summary = await screen.findByTestId("farm-summary");
    expect(within(summary).getByText("2.5 ha")).toBeInTheDocument();
    expect(within(summary).getByText("Loam")).toBeInTheDocument();
    expect(
      within(summary).getByText("Groundwater 20,000 L/day"),
    ).toBeInTheDocument();
    expect(
      within(summary).getByText("Stored water 100,000 L total"),
    ).toBeInTheDocument();
  });

  it("showsHintWhenNoFarms", async () => {
    farms = [];
    renderAssess();
    expect(await screen.findByText("Add a farm first.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Go to farms" });
    expect(link).toHaveAttribute("href", "/farms");
  });

  it("walksThroughStepsAndSubmits", async () => {
    api.post.mockResolvedValueOnce({ data: { id: "a1" } });
    renderAssess();
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "North Field" });
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.selectOptions(screen.getByLabelText("Crop"), "c2");
    await user.selectOptions(screen.getByLabelText("Horizon (days)"), "60");
    await user.click(screen.getByRole("button", { name: "Next" }));
    const review = screen.getByTestId("review");
    expect(within(review).getByText("North Field")).toBeInTheDocument();
    expect(within(review).getByText("Wheat")).toBeInTheDocument();
    expect(within(review).getByText("60 days")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Run assessment" }));
    expect(api.post).toHaveBeenCalledWith("/api/assessments", {
      farmId: "f1",
      cropId: "c2",
      horizonDays: 60,
    });
    expect(await screen.findByText("Result page")).toBeInTheDocument();
  });

  it("backKeepsChoices", async () => {
    renderAssess();
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "North Field" });
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.selectOptions(screen.getByLabelText("Crop"), "c2");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Crop")).toHaveValue("c2");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Farm")).toHaveValue("f1");
  });

  it("showsCropCycleLength", async () => {
    renderAssess();
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "North Field" });
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByText("2 growth stages, 90 days in total"),
    ).toBeInTheDocument();
  });

  it("showsServerErrorOnRun", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Farm not found" } },
    });
    renderAssess();
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "North Field" });
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Run assessment" }));
    expect(await screen.findByText("Farm not found")).toBeInTheDocument();
  });
});
