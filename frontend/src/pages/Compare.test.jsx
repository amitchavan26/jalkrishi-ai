import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Compare from "./Compare";
import * as api from "../api";

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }) => (
    <div data-testid="bar">
      {data.labels.join(",")}|{data.datasets[0].data.join(",")}
    </div>
  ),
}));

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } };
});

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }) => (
    <div data-testid="bar">
      {data.labels.join(",")}|{data.datasets[0].data.join(",")}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Compare", () => {
  it("renders results in received order", async () => {
    api.api.get.mockImplementation((url) =>
      Promise.resolve({
        data:
          url === "/api/farms"
            ? [{ id: "f1", name: "North Field" }]
            : [
                { id: "c1", name: "Rice" },
                { id: "c2", name: "Wheat" },
                { id: "c3", name: "Cotton" },
              ],
      }),
    );
    api.api.post.mockResolvedValue({
      data: [
        { cropId: "c2", ratio: 1.234, suitability: "EXCELLENT", stress: "LOW" },
        {
          cropId: "c1",
          ratio: 0.5,
          suitability: "NOT_RECOMMENDED",
          stress: "HIGH",
        },
      ],
    });

    render(
      <MemoryRouter>
        <Compare />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Farm")).toBeInTheDocument();
    });

    const riceCheckbox = screen.getByLabelText("Rice");
    const wheatCheckbox = screen.getByLabelText("Wheat");

    await userEvent.click(riceCheckbox);
    await userEvent.click(wheatCheckbox);

    const compareButton = screen.getByRole("button", { name: "Compare crops" });
    await userEvent.click(compareButton);

    await waitFor(() => {
      expect(api.api.post).toHaveBeenCalledWith("/api/assessments/compare", {
        farmId: "f1",
        cropIds: ["c1", "c2"],
        horizonDays: 30,
      });
    });

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Wheat");
    expect(rows[0]).toHaveTextContent("1.23");
    expect(rows[0]).toHaveTextContent("Excellent");
    expect(rows[1]).toHaveTextContent("Rice");
    expect(rows[1]).toHaveTextContent("0.50");
    expect(rows[1]).toHaveTextContent("Not recommended");
  });

  it("compare button disabled without crops", async () => {
    api.api.get.mockImplementation((url) =>
      Promise.resolve({
        data:
          url === "/api/farms"
            ? [{ id: "f1", name: "North Field" }]
            : [
                { id: "c1", name: "Rice" },
                { id: "c2", name: "Wheat" },
              ],
      }),
    );

    render(
      <MemoryRouter>
        <Compare />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Farm")).toBeInTheDocument();
    });

    const compareButton = screen.getByRole("button", { name: "Compare crops" });
    expect(compareButton).toBeDisabled();
  });
});

describe("Compare chart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows bar chart with ratios", async () => {
    api.api.get.mockImplementation((url) =>
      Promise.resolve({
        data:
          url === "/api/farms"
            ? [{ id: "f1", name: "North Field" }]
            : [
                { id: "c1", name: "Rice" },
                { id: "c2", name: "Wheat" },
              ],
      }),
    );
    api.api.post.mockResolvedValue({
      data: [
        { cropId: "c2", ratio: 1.234, suitability: "EXCELLENT", stress: "LOW" },
        {
          cropId: "c1",
          ratio: 0.5,
          suitability: "NOT_RECOMMENDED",
          stress: "HIGH",
        },
      ],
    });

    render(
      <MemoryRouter>
        <Compare />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Farm")).toBeInTheDocument();
    });

    const riceCheckbox = screen.getByLabelText("Rice");
    const wheatCheckbox = screen.getByLabelText("Wheat");

    await userEvent.click(riceCheckbox);
    await userEvent.click(wheatCheckbox);

    const compareButton = screen.getByRole("button", { name: "Compare crops" });
    await userEvent.click(compareButton);

    await waitFor(() => {
      expect(screen.getByTestId("bar")).toHaveTextContent(
        "Wheat,Rice|1.234,0.5",
      );
    });
  });
});
