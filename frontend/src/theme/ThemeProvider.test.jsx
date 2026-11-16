import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeProvider";
import ThemeToggle from "./ThemeToggle";

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: window.__prefersDark === true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  test("followsSystemDark", () => {
    window.__prefersDark = true;
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveClass("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
  });

  test("followsSystemLight", () => {
    window.__prefersDark = false;
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(document.documentElement).not.toHaveClass("dark");
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();
  });

  test("toggleSwitchesAndSaves", async () => {
    window.__prefersDark = false;
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: "Switch to dark mode" });

    // Click to switch to dark
    const user = userEvent.setup();
    await user.click(button);

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("jk_theme")).toBe("dark");

    // Click again to switch back to light
    const button2 = screen.getByRole("button", {
      name: "Switch to light mode",
    });
    await user.click(button2);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("jk_theme")).toBe("light");
  });

  test("storedChoiceBeatsSystem", () => {
    localStorage.setItem("jk_theme", "light");
    window.__prefersDark = true;

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(document.documentElement).not.toHaveClass("dark");
  });
});
