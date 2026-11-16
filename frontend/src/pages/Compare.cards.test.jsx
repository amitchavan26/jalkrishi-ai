import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Compare from "./Compare";
import * as api from "../api";

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }) => <div data-testid="bar">{data.labels.join(",")}</div>,
}));

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Compare cards", () => {
  const setup = async () => {
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
        { cropId: "c1", ratio: 0.5, suitability: "NOT_RECOMMENDED", stress: "HIGH" },
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
  };

  it("marksTheBestChoice", async () => {
    await setup();
    expect(screen.getAllByText("Best choice")).toHaveLength(1);
    expect(screen.queryByText("Highest ratio")).toBeNull();
  });

  it("labelsHighestRatioWhenNothingFits", async () => {
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
        { cropId: "c2", ratio: 0.4, suitability: "NOT_RECOMMENDED", stress: "HIGH" },
        { cropId: "c1", ratio: 0.3, suitability: "NOT_RECOMMENDED", stress: "HIGH" },
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
      expect(screen.getAllByText("Highest ratio")).toHaveLength(1);
      expect(screen.queryByText("Best choice")).toBeNull();
    });
  });

  it("selectAllAndClear", async () => {
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

    await screen.findByLabelText("Rice");
    await screen.findByLabelText("Wheat");

    const selectAllButton = screen.getByRole("button", { name: "Select all crops" });
    await userEvent.click(selectAllButton);

    expect(screen.getByLabelText("Rice")).toBeChecked();
    expect(screen.getByLabelText("Wheat")).toBeChecked();
    expect(screen.getByRole("button", { name: "Compare crops" })).toBeEnabled();

    const clearButton = screen.getByRole("button", { name: "Clear selection" });
    await userEvent.click(clearButton);

    expect(screen.getByLabelText("Rice")).not.toBeChecked();
    expect(screen.getByLabelText("Wheat")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Compare crops" })).toBeDisabled();
  });

  it("showsLoadingStatus", async () => {
    api.api.get.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <Compare />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("progressBarsMatchTheRatio", async () => {
    await setup();

    const barC2 = screen.getByTestId("ratio-bar-c2");
    const barC1 = screen.getByTestId("ratio-bar-c1");

    expect(barC2.style.width).toBe("82.3%");
    expect(barC1.style.width).toBe("33.3%");
  });
});