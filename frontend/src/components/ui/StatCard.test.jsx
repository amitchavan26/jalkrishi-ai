import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("showsLabelAndValue", () => {
    render(<StatCard label="Farms" value="3" />);
    expect(screen.getByText("Farms")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("showsTrendText", () => {
    render(
      <StatCard
        label="Revenue"
        value="100"
        trend={{ direction: "up", text: "+2 this week" }}
      />,
    );
    expect(screen.getByText("+2 this week")).toBeInTheDocument();
  });
});
