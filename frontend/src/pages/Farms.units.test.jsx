import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Farms from "./Farms";
import { api } from "../api";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock("../components/FarmMap", () => ({
  default: ({ onPick }) => (
    <button type="button" onClick={() => onPick(18.52, 73.85)}>
      Pick location
    </button>
  ),
}));

vi.mock("../geocode", () => ({
  searchPlaces: vi.fn(),
}));

describe("Farms page - units and water helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({
      data: {
        id: "f9",
        name: "F",
        lat: 18.52,
        lon: 73.85,
        areaHa: 1,
        soilType: "Loam",
        storedWaterLitres: 0,
        groundwaterLitres: 0,
      },
    });
  });

  it("acresAreConvertedToHectares", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByText("No farms yet.");

    await user.type(screen.getByLabelText("Name"), "F");
    await user.click(screen.getByRole("button", { name: "Pick location" }));

    await user.selectOptions(screen.getByLabelText("Area unit"), "acre");
    await user.type(screen.getByLabelText("Area (acre)"), "10");

    expect(screen.getByText("= 4.0469 ha")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add farm" }));

    expect(api.post).toHaveBeenCalledWith("/api/farms", {
      name: "F",
      lat: 18.52,
      lon: 73.85,
      areaHa: 4.0469,
      soilType: "Loam",
      storedWaterLitres: 0,
      groundwaterLitres: 0,
    });
  });

  it("groundwaterPerDayIsSentAsPerDay", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByText("No farms yet.");

    await user.type(screen.getByLabelText("Name"), "F");
    await user.click(screen.getByRole("button", { name: "Pick location" }));
    await user.type(screen.getByLabelText("Area (ha)"), "1");
    await user.type(
      screen.getByLabelText("Groundwater (litres per day)"),
      "20000",
    );

    await user.click(screen.getByRole("button", { name: "Add farm" }));

    expect(api.post).toHaveBeenCalledWith("/api/farms", {
      name: "F",
      lat: 18.52,
      lon: 73.85,
      areaHa: 1,
      soilType: "Loam",
      storedWaterLitres: 0,
      groundwaterLitres: 0,
      groundwaterLitresPerDay: 20000,
    });
  });

  it("totalUnitSendsTotals", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByText("No farms yet.");

    await user.type(screen.getByLabelText("Name"), "F");
    await user.click(screen.getByRole("button", { name: "Pick location" }));
    await user.type(screen.getByLabelText("Area (ha)"), "1");

    await user.selectOptions(
      screen.getByLabelText("Groundwater unit"),
      "total",
    );
    await user.type(
      screen.getByLabelText("Groundwater (litres in total)"),
      "45000",
    );

    await user.click(screen.getByRole("button", { name: "Add farm" }));

    expect(api.post).toHaveBeenCalledWith("/api/farms", {
      name: "F",
      lat: 18.52,
      lon: 73.85,
      areaHa: 1,
      soilType: "Loam",
      storedWaterLitres: 0,
      groundwaterLitres: 45000,
    });
  });

  it("pumpHelperFillsGroundwaterPerDay", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByText("No farms yet.");

    await user.type(screen.getByLabelText("Name"), "F");
    await user.click(screen.getByRole("button", { name: "Pick location" }));
    await user.type(screen.getByLabelText("Area (ha)"), "1");

    // Clear the default value first, then type
    await user.clear(screen.getByLabelText("Seconds to fill the bucket"));
    await user.type(screen.getByLabelText("Seconds to fill the bucket"), "15");
    await user.clear(screen.getByLabelText("Pump hours per day"));
    await user.type(screen.getByLabelText("Pump hours per day"), "4");

    expect(screen.getByText("80.0 litres per minute")).toBeInTheDocument();
    expect(screen.getByText("19,200 litres per day")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Use for groundwater" }),
    );

    expect(screen.getByLabelText("Groundwater (litres per day)")).toHaveValue(
      19200,
    );
  });

  it("tankHelperFillsStoredWaterPerDay", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByText("No farms yet.");

    await user.type(screen.getByLabelText("Name"), "F");
    await user.click(screen.getByRole("button", { name: "Pick location" }));
    await user.type(screen.getByLabelText("Area (ha)"), "1");

    await user.type(screen.getByLabelText("Length"), "20");
    await user.type(screen.getByLabelText("Width"), "10");
    await user.type(screen.getByLabelText("Average water depth"), "2");

    expect(screen.getByText("400,000 litres in total")).toBeInTheDocument();
    expect(screen.getByText("6,667 litres per day")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Use for stored water" }),
    );

    expect(screen.getByLabelText("Stored water (litres per day)")).toHaveValue(
      6667,
    );
  });
});
