import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import * as api from "../api";

const EXCELLENT = "EXCELLENT";
const GOOD = "GOOD";
const RISKY = "RISKY";
const NOT_RECOMMENDED = "NOT_RECOMMENDED";

vi.mock("react-chartjs-2", () => ({
  Doughnut: ({ data }) => (
    <div data-testid="doughnut">{data.datasets[0].data.join(",")}</div>
  ),
  Line: ({ data }) => <div data-testid="line">{data.labels.length}</div>,
}));

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn() } };
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Dashboard", () => {
  test("showsStatCards", async () => {
    api.api.get.mockImplementation((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({ data: { name: "Amit" } });
      }
      if (url === "/api/farms") {
        return Promise.resolve({ data: [{ id: "f1" }, { id: "f2" }] });
      }
      if (url === "/api/assessments") {
        return Promise.resolve({
          data: [
            {
              id: "a1",
              ratio: 1.2,
              suitability: EXCELLENT,
              createdAt: "2026-11-01T10:00:00Z",
            },
            {
              id: "a2",
              ratio: 0.9,
              suitability: GOOD,
              createdAt: "2026-11-02T10:00:00Z",
            },
            {
              id: "a3",
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
              message: "x",
              createdAt: "2026-11-06T10:00:00Z",
            },
          ],
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Welcome, Amit")).toBeInTheDocument();
    expect(screen.getByTestId("stat-farms")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-assessments")).toHaveTextContent("3");
    expect(screen.getByTestId("stat-alerts")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-avg")).toHaveTextContent("0.87");
  });

  test("doughnutCountsPerClass", async () => {
    api.api.get.mockImplementation((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({ data: { name: "Amit" } });
      }
      if (url === "/api/farms") {
        return Promise.resolve({ data: [{ id: "f1" }] });
      }
      if (url === "/api/assessments") {
        return Promise.resolve({
          data: [
            {
              id: "a1",
              ratio: 1.2,
              suitability: EXCELLENT,
              createdAt: "2026-11-01T10:00:00Z",
            },
            {
              id: "a2",
              ratio: 0.9,
              suitability: GOOD,
              createdAt: "2026-11-02T10:00:00Z",
            },
            {
              id: "a3",
              ratio: 0.5,
              suitability: NOT_RECOMMENDED,
              createdAt: "2026-11-03T10:00:00Z",
            },
          ],
        });
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

    await waitFor(() => {
      expect(screen.getByTestId("doughnut")).toHaveTextContent("1,1,0,1");
    });
  });

  test("showsEmptyStateWithoutAssessments", async () => {
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

    expect(await screen.findByText("No assessments yet.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Run your first assessment" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("doughnut")).toBeNull();
    expect(screen.getByTestId("stat-avg")).toHaveTextContent("-");
  });
});
