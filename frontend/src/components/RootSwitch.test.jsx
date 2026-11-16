import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import RootSwitch from "../components/RootSwitch";

vi.mock("../pages/Landing", () => ({
  default: () => <div>Landing page</div>,
}));

describe("RootSwitch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("showsLandingWithoutToken", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<RootSwitch />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Landing page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard page")).not.toBeInTheDocument();
  });

  it("redirectsToDashboardWithToken", () => {
    localStorage.setItem("jk_token", "x");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<RootSwitch />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard page")).toBeInTheDocument();
    expect(screen.queryByText("Landing page")).not.toBeInTheDocument();
  });
});
