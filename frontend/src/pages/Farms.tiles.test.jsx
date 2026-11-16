import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
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

describe("Farms page - tiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const farm = {
    id: "f1",
    name: "North Field",
    lat: 18.52,
    lon: 73.85,
    areaHa: 2.5,
    soilType: "Loam",
    storedWaterLitres: 100000,
    groundwaterLitres: 0,
    storedWaterLitresPerDay: 0,
    groundwaterLitresPerDay: 20000,
    village: "Pimpalgaon",
    district: "Nashik",
    state: "Maharashtra",
    country: "India",
  };

  it("showsFarmDetailsInATile", async () => {
    api.get.mockResolvedValueOnce({ data: [farm] });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    const tile = await screen.findByRole("article", { name: "North Field" });
    expect(tile).toBeInTheDocument();

    const tileContent = within(tile);
    expect(tileContent.getByText("Loam")).toBeInTheDocument();
    expect(
      tileContent.getByText("Pimpalgaon, Nashik, Maharashtra, India"),
    ).toBeInTheDocument();
    expect(tileContent.getByText("2.5 ha")).toBeInTheDocument();
    expect(
      tileContent.getByText("Groundwater 20,000 L/day"),
    ).toBeInTheDocument();
    expect(
      tileContent.getByText("Stored water 100,000 L total"),
    ).toBeInTheDocument();
  });

  it("areaDisplayTogglesToAcres", async () => {
    api.get.mockResolvedValueOnce({ data: [farm] });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    const tile = await screen.findByRole("article", { name: "North Field" });
    expect(screen.getByText("2.5 ha")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Acres" }));
    expect(screen.getByText("6.18 acres")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Hectares" }));
    expect(screen.getByText("2.5 ha")).toBeInTheDocument();
  });

  it("mapLinkHasCoordinates", async () => {
    api.get.mockResolvedValueOnce({ data: [farm] });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByRole("article", { name: "North Field" });
    const link = screen.getByRole("link", {
      name: "Open North Field in OpenStreetMap",
    });
    expect(link).toHaveAttribute("href", expect.stringContaining("mlat=18.52"));
    expect(link).toHaveAttribute("href", expect.stringContaining("mlon=73.85"));
  });

  it("showsLoadingStatus", async () => {
    api.get.mockReturnValueOnce(new Promise(() => {}));
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading farms...")).toBeInTheDocument();
  });

  it("sliderUpdatesThePumpResult", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByText("No farms yet.");

    const secondsInput = screen.getByLabelText("Seconds to fill the bucket");
    await userEvent.clear(secondsInput);
    await userEvent.type(secondsInput, "15");

    const slider = screen.getByLabelText("Pump hours per day slider");
    fireEvent.change(slider, { target: { value: "6" } });

    expect(screen.getByText("28,800 litres per day")).toBeInTheDocument();
    expect(screen.getByLabelText("Pump hours per day")).toHaveValue(6);
  });

  it("showsPumpCaption", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(
      <MemoryRouter>
        <Farms />
      </MemoryRouter>,
    );

    await screen.findByText("No farms yet.");

    const secondsInput = screen.getByLabelText("Seconds to fill the bucket");
    await userEvent.clear(secondsInput);
    await userEvent.type(secondsInput, "15");

    const slider = screen.getByLabelText("Pump hours per day slider");
    fireEvent.change(slider, { target: { value: "6" } });

    expect(
      screen.getByText("Pump runs 6 of 24 hours a day"),
    ).toBeInTheDocument();
  });
});
