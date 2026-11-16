import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../components/ui";
import Farms from "./Farms";
import * as api from "../api";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } };
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

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

function renderFarms() {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <Farms />
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe("Farms toast", () => {
  it("toastsAfterAddingAFarm", async () => {
    const user = userEvent.setup();
    api.api.get.mockResolvedValue({ data: [] });
    api.api.post.mockResolvedValue({
      data: {
        id: "f9",
        name: "My Farm",
        lat: 18.52,
        lon: 73.85,
        areaHa: 2.5,
        soilType: "Loam",
        storedWaterLitres: 0,
        groundwaterLitres: 0,
      },
    });
    renderFarms();
    await waitFor(() => screen.getByRole("button", { name: /add farm/i }));
    await user.type(screen.getByLabelText("Name"), "My Farm");
    await user.click(screen.getByRole("button", { name: "Pick location" }));
    await user.type(screen.getByLabelText("Area (ha)"), "2.5");
    await user.click(screen.getByRole("button", { name: /add farm/i }));
    await waitFor(() => {
      const region = screen.getByRole("region", { name: "Notifications" });
      expect(region).toHaveTextContent("Farm added");
    });
  });

  it("toastsAfterDeletingAFarm", async () => {
    const user = userEvent.setup();
    api.api.get.mockResolvedValue({
      data: [
        {
          id: "f1",
          name: "North Field",
          lat: 18.52,
          lon: 73.85,
          areaHa: 2.5,
          soilType: "Loam",
        },
      ],
    });
    api.api.delete.mockResolvedValue({});
    renderFarms();
    await waitFor(() => screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      const region = screen.getByRole("region", { name: "Notifications" });
      expect(region).toHaveTextContent("Farm deleted");
    });
  });
});
