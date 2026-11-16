import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import History from "./History";
import * as api from "../api";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn() } };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("History", () => {
  it("renders row with names", async () => {
    api.api.get.mockImplementation((url) => {
      if (url === "/api/assessments") {
        return Promise.resolve({
          data: [
            {
              id: "a1",
              farmId: "f1",
              cropId: "c1",
              horizonDays: 60,
              ratio: 0.9,
              suitability: "GOOD",
              createdAt: "2026-11-06T10:00:00Z",
            },
          ],
        });
      }
      if (url === "/api/farms") {
        return Promise.resolve({ data: [{ id: "f1", name: "North Field" }] });
      }
      if (url === "/api/crops") {
        return Promise.resolve({ data: [{ id: "c1", name: "Rice" }] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("North Field")).toBeInTheDocument();
      expect(screen.getByText("Rice")).toBeInTheDocument();
      expect(screen.getByText("60 days")).toBeInTheDocument();
      expect(screen.getByText("0.90")).toBeInTheDocument();
      expect(screen.getByText("Good")).toBeInTheDocument();
    });
  });

  it("shows empty state", async () => {
    api.api.get.mockImplementation((url) => {
      if (url === "/api/assessments") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/api/farms") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/api/crops") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("No assessments yet.")).toBeInTheDocument();
    });
  });
});
