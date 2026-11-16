import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Landing from "./Landing";

describe("Landing page", () => {
  it("showsHeadlineAndCalls", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Can I grow this crop?",
    });
    expect(heading).toBeInTheDocument();

    const getStartedLink = screen.getByRole("link", { name: "Get started" });
    expect(getStartedLink).toHaveAttribute("href", "/register");

    const checkFarmLink = screen.getByRole("link", { name: "Check my farm" });
    expect(checkFarmLink).toHaveAttribute("href", "/register");

    const loginLinks = screen.getAllByRole("link", { name: "Log in" });
    expect(loginLinks[0]).toHaveAttribute("href", "/login");
  });

  it("explainsHowItWorks", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByText("1. Add your farm")).toBeInTheDocument();
    expect(screen.getByText("2. Choose a crop")).toBeInTheDocument();
    expect(screen.getByText("3. Read the answer")).toBeInTheDocument();
  });

  it("explainsResultClasses", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByText(/Ratio 1\.0 or more/)).toBeInTheDocument();
    expect(screen.getByText(/Ratio 0\.8 to 1\.0/)).toBeInTheDocument();
    expect(screen.getByText(/Ratio 0.6 to 0.8/)).toBeInTheDocument();
    expect(screen.getByText(/Ratio below 0\.6/)).toBeInTheDocument();
  });
});
