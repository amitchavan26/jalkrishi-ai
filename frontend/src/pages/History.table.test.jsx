import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import History from "./History";
import * as api from "../api";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn() } };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("History table", () => {
  const row = (i, ratio, suitability, day) => ({
    id: "a" + i,
    farmId: "f1",
    cropId: "c1",
    horizonDays: 30,
    ratio,
    suitability,
    createdAt: "2026-11-" + String(day).padStart(2, "0") + "T10:00:00Z",
  });

  const dataRows = () => screen.getAllByRole("row").slice(1);

  it("defaultOrderIsNewestFirst", async () => {
    const list = [
      row(1, 1.2, "EXCELLENT", 1),
      row(2, 0.9, "GOOD", 2),
      row(3, 0.77, "RISKY", 3),
    ];

    api.api.get.mockImplementation((url) => {
      if (url === "/api/assessments") return Promise.resolve({ data: list });
      if (url === "/api/farms") return Promise.resolve({ data: [{ id: "f1", name: "North Field" }] });
      if (url === "/api/crops") return Promise.resolve({ data: [{ id: "c1", name: "Rice" }] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const rows = dataRows();
    expect(rows[0]).toHaveTextContent("0.77");
    expect(rows[rows.length - 1]).toHaveTextContent("1.20");
  });

  it("filtersByClass", async () => {
    const list = [
      row(1, 1.2, "EXCELLENT", 1),
      row(2, 0.9, "GOOD", 2),
      row(3, 0.5, "NOT_RECOMMENDED", 3),
    ];

    api.api.get.mockImplementation((url) => {
      if (url === "/api/assessments") return Promise.resolve({ data: list });
      if (url === "/api/farms") return Promise.resolve({ data: [{ id: "f1", name: "North Field" }] });
      if (url === "/api/crops") return Promise.resolve({ data: [{ id: "c1", name: "Rice" }] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const filterSelect = screen.getByLabelText("Filter by suitability");
    await userEvent.selectOptions(filterSelect, "GOOD");

    const rows = dataRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("0.90");
  });

  it("sortsByRatio", async () => {
    const list = [
      row(1, 1.2, "EXCELLENT", 1),
      row(2, 0.9, "GOOD", 2),
      row(3, 0.5, "NOT_RECOMMENDED", 3),
    ];

    api.api.get.mockImplementation((url) => {
      if (url === "/api/assessments") return Promise.resolve({ data: list });
      if (url === "/api/farms") return Promise.resolve({ data: [{ id: "f1", name: "North Field" }] });
      if (url === "/api/crops") return Promise.resolve({ data: [{ id: "c1", name: "Rice" }] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const ratioButton = screen.getByRole("button", { name: /Ratio/i });
    await userEvent.click(ratioButton);

    let rows = dataRows();
    expect(rows[0]).toHaveTextContent("0.50");
    expect(ratioButton).toHaveAttribute("aria-sort", "ascending");

    await userEvent.click(ratioButton);

    rows = dataRows();
    expect(rows[0]).toHaveTextContent("1.20");
    expect(ratioButton).toHaveAttribute("aria-sort", "descending");
  });

  it("paginates", async () => {
    const list = Array.from({ length: 12 }, (_, i) =>
      row(i + 1, 0.5 + (i + 1) / 100, "RISKY", i + 1),
    );

    api.api.get.mockImplementation((url) => {
      if (url === "/api/assessments") return Promise.resolve({ data: list });
      if (url === "/api/farms") return Promise.resolve({ data: [{ id: "f1", name: "North Field" }] });
      if (url === "/api/crops") return Promise.resolve({ data: [{ id: "c1", name: "Rice" }] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Showing 1 to 10 of 12")).toBeInTheDocument();
    });

    let rows = dataRows();
    expect(rows).toHaveLength(10);

    const nextButton = screen.getByRole("button", { name: "Next page" });
    await userEvent.click(nextButton);

    expect(screen.getByText("Showing 11 to 12 of 12")).toBeInTheDocument();
    rows = dataRows();
    expect(rows).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("showsSkeletonWhileLoading", async () => {
    api.api.get.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading history...")).toBeInTheDocument();
  });

  it("emptyFilterShowsHintAndClears", async () => {
    const list = [row(1, 1.2, "EXCELLENT", 1)];

    api.api.get.mockImplementation((url) => {
      if (url === "/api/assessments") return Promise.resolve({ data: list });
      if (url === "/api/farms") return Promise.resolve({ data: [{ id: "f1", name: "North Field" }] });
      if (url === "/api/crops") return Promise.resolve({ data: [{ id: "c1", name: "Rice" }] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const filterSelect = screen.getByLabelText("Filter by suitability");
    await userEvent.selectOptions(filterSelect, "RISKY");

    expect(screen.getByText("No assessments match this filter.")).toBeInTheDocument();

    const clearButton = screen.getByRole("button", { name: "Clear filter" });
    await userEvent.click(clearButton);

    const rows = dataRows();
    expect(rows).toHaveLength(1);
  });
});