import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../components/ui";
import Alerts from "./Alerts";
import * as api from "../api";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return { ...actual, api: { get: vi.fn() } };
});

const alerts = [
  {
    assessmentId: "a1",
    farmId: "f1",
    cropId: "c1",
    message:
      "NOT_RECOMMENDED: water ratio is 0.40, driven by low effective rainfall.",
    createdAt: "2026-11-06T10:00:00Z",
  },
  {
    assessmentId: "a2",
    farmId: "f1",
    cropId: "c2",
    message:
      "NOT_RECOMMENDED: water ratio is 0.30, driven by high evapotranspiration demand.",
    createdAt: "2026-11-05T10:00:00Z",
  },
];

const M1 = alerts[0].message;
const M2 = alerts[1].message;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  api.api.get.mockResolvedValue({ data: alerts });
});

function renderAlerts() {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <Alerts />
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe("Alerts manage", () => {
  it("hideRemovesTheAlert", async () => {
    const user = userEvent.setup();
    renderAlerts();
    await waitFor(() => screen.getByText(M1));
    await user.click(screen.getAllByRole("button", { name: "Hide" })[0]);
    expect(screen.queryByText(M1)).toBeNull();
    expect(screen.getByText(M2)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("jk_hidden_alerts"));
    expect(stored.a1).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("snoozeStoresAFutureTime", async () => {
    const user = userEvent.setup();
    renderAlerts();
    await waitFor(() => screen.getByText(M1));
    await user.click(
      screen.getAllByRole("button", { name: "Snooze 1 day" })[0],
    );
    expect(screen.queryByText(M1)).toBeNull();
    const stored = JSON.parse(localStorage.getItem("jk_hidden_alerts"));
    expect(stored.a1).toBeGreaterThan(Date.now());
  });

  it("showAllRestores", async () => {
    const user = userEvent.setup();
    renderAlerts();
    await waitFor(() => screen.getByText(M1));
    await user.click(screen.getAllByRole("button", { name: "Hide" })[0]);
    expect(screen.getByText("1 hidden on this device")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show all alerts" }));
    expect(screen.getByText(M1)).toBeInTheDocument();
    expect(screen.getByText(M2)).toBeInTheDocument();
  });

  it("allHiddenShowsHint", async () => {
    const user = userEvent.setup();
    renderAlerts();
    await waitFor(() => screen.getByText(M1));
    await user.click(screen.getAllByRole("button", { name: "Hide" })[0]);
    await waitFor(() => screen.getByText(M2));
    await user.click(screen.getAllByRole("button", { name: "Hide" })[0]);
    expect(
      screen.getByText("All alerts are hidden on this device."),
    ).toBeInTheDocument();
    expect(screen.queryByText("No alerts. Your crops look safe.")).toBeNull();
  });

  it("hiddenStateSurvivesAReload", async () => {
    localStorage.setItem(
      "jk_hidden_alerts",
      JSON.stringify({ a1: Number.MAX_SAFE_INTEGER }),
    );
    renderAlerts();
    await waitFor(() => screen.getByText(M2));
    expect(screen.getByText(M2)).toBeInTheDocument();
    expect(screen.queryByText(M1)).toBeNull();
    expect(screen.getByText("1 hidden on this device")).toBeInTheDocument();
  });

  it("hidingShowsAToast", async () => {
    const user = userEvent.setup();
    renderAlerts();
    await waitFor(() => screen.getByText(M1));
    await user.click(screen.getAllByRole("button", { name: "Hide" })[0]);
    expect(screen.getByText("Alert hidden on this device")).toBeInTheDocument();
  });
});
