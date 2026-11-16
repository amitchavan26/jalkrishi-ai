import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import * as api from "../api";

const EXCELLENT = "EXCELLENT";
const GOOD = "GOOD";
const RISKY = "RISKY";
const NOT_RECOMMENDED = "NOT_RECOMMENDED";

vi.mock("react-chartjs-2", () => ({
  Doughnut: () => <div data-testid="doughnut" />,
  Line: () => <div data-testid="line" />,
}));

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn() } };
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Dashboard bento", () => {
  const defaultMocks = () => {
    api.api.get.mockImplementation((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({ data: { name: "Amit" } });
      }
      if (url === "/api/farms") {
        return Promise.resolve({
          data: [
            { id: "f1", name: "North" },
            { id: "f2", name: "South" },
          ],
        });
      }
      if (url === "/api/assessments") {
        return Promise.resolve({
          data: [
            {
              id: "a1",
              farmId: "f1",
              cropId: "c1",
              ratio: 1.2,
              suitability: EXCELLENT,
              createdAt: "2026-11-01T10:00:00Z",
            },
            {
              id: "a2",
              farmId: "f1",
              cropId: "c1",
              ratio: 0.9,
              suitability: GOOD,
              createdAt: "2026-11-02T10:00:00Z",
            },
            {
              id: "a3",
              farmId: "f1",
              cropId: "c1",
              ratio: 0.5,
              suitability: NOT_RECOMMENDED,
              createdAt: "2026-11-03T10:00:00Z",
            },
          ],
        });
      }
      if (url === "/api/alerts") {
        return Promise.resolve({
          data: [
            {
              assessmentId: "a1",
              farmId: "f1",
              cropId: "c1",
              message:
                "NOT_RECOMMENDED: water ratio is 0.40, driven by low effective rainfall.",
              createdAt: "2026-11-06T10:00:00Z",
            },
          ],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  };

  test("showsGreetingAndSummary", async () => {
    defaultMocks();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await screen.findByText(/Good (morning|afternoon|evening)/);
    expect(await screen.findByText("Welcome, Amit")).toBeInTheDocument();
    expect(
      await screen.findByText("You have 2 farms and 3 assessments."),
    ).toBeInTheDocument();
  });

  test("showsHealthRing", async () => {
    defaultMocks();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await screen.findByRole("img", {
      name: "Assessments rated Excellent or Good 67 percent",
    });
  });

  test("showsAlertTimeline", async () => {
    defaultMocks();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await screen.findByText(
      "NOT_RECOMMENDED: water ratio is 0.40, driven by low effective rainfall.",
    );
    const viewAlertLink = screen.getByRole("link", { name: "View alert" });
    expect(viewAlertLink).toHaveAttribute("href", "/assessments/a1");
  });

  test("showsQuickActionTiles", async () => {
    defaultMocks();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const newAssessmentLink = await screen.findByRole("link", {
      name: /New assessment/,
    });
    expect(newAssessmentLink).toHaveAttribute("href", "/assess");

    const addFarmLink = screen.getByRole("link", { name: /Add farm/ });
    expect(addFarmLink).toHaveAttribute("href", "/farms");

    const compareCropsLink = screen.getByRole("link", {
      name: "Compare crops",
    });
    expect(compareCropsLink).toHaveAttribute("href", "/compare");
  });

  test("emptyStateHasNoRing", async () => {
    api.api.get.mockImplementation((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({ data: { name: "Amit" } });
      }
      if (url === "/api/farms") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/api/assessments") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/api/alerts") {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await screen.findByText("No assessments yet.");
    expect(screen.queryByRole("img", { name: /Excellent or Good/ })).toBeNull();
    expect(screen.queryByTestId("doughnut")).toBeNull();
  });

  test("showsLoadingStatus", async () => {
    api.api.get.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });
});
