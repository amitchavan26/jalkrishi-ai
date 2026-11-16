import { describe, it, expect, vi, beforeEach, waitFor } from "vitest";
import {
  render,
  screen,
  within,
  waitFor as waitForTL,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "../theme/ThemeProvider";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppShell from "./AppShell";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from "../api";

describe("AppShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    api.get.mockImplementation((url) =>
      Promise.resolve({
        data:
          url === "/api/auth/me"
            ? { name: "Amit", email: "amit@example.com" }
            : [{ assessmentId: "a1" }, { assessmentId: "a2" }],
      }),
    );
  });

  function renderAppShell() {
    return render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="dashboard" element={<div>Dashboard body</div>} />
              <Route path="alerts" element={<div>Alerts body</div>} />
            </Route>
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );
  }

  test("showsNavigationAndPageBody", () => {
    renderAppShell();
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    within(nav).getByRole("link", { name: /Dashboard/ });
    within(nav).getByRole("link", { name: /Farms/ });
    within(nav).getByRole("link", { name: /Assess/ });
    within(nav).getByRole("link", { name: /Compare/ });
    within(nav).getByRole("link", { name: /Alerts/ });
    within(nav).getByRole("link", { name: /History/ });
    expect(screen.getByText("Dashboard body")).toBeInTheDocument();
  });

  test("showsTheUserFromTheApi", async () => {
    renderAppShell();
    await waitForTL(async () => {
      const elements = await screen.findAllByText("Amit");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test("showsAlertCount", async () => {
    renderAppShell();
    await waitForTL(() => {
      const nav = screen.getByRole("navigation", { name: "Main navigation" });
      const alertsLink = within(nav).getByRole("link", { name: /Alerts/ });
      expect(alertsLink.textContent).toContain("2");
    });
  });

  test("logoutClearsTheToken", async () => {
    localStorage.setItem("jk_token", "x");
    renderAppShell();
    const logoutButtons = screen.getAllByRole("button", { name: "Log out" });
    await userEvent.click(logoutButtons[0]);
    expect(localStorage.getItem("jk_token")).toBeNull();
    await waitForTL(async () => {
      const el = await screen.findByText("Login page");
      expect(el).toBeInTheDocument();
    });
  });

  test("themeToggleWorks", async () => {
    renderAppShell();
    const toggleButton = screen.getByRole("button", {
      name: "Switch to dark mode",
    });
    await userEvent.click(toggleButton);
    expect(document.documentElement).toHaveClass("dark");
  });

  test("drawerOpensAndEscapeCloses", async () => {
    renderAppShell();
    const openButton = screen.getByRole("button", { name: "Open menu" });
    await userEvent.click(openButton);
    const dialog = screen.getByRole("dialog", { name: "Navigation menu" });
    expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitForTL(() => {
      expect(dialog).not.toBeInTheDocument();
    });
  });

  test("redirectsToLoginOnUnauthorized", async () => {
    localStorage.setItem("jk_token", "x");
    api.get.mockRejectedValue({ response: { status: 401 } });
    renderAppShell();
    await waitForTL(async () => {
      const el = await screen.findByText("Login page");
      expect(el).toBeInTheDocument();
    });
  });
});
