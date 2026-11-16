import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Layout from "./Layout";

vi.mock("../api", async () => {
  const actual = await vi.importActual("../api");
  return {
    ...actual,
    clearToken: vi.fn(() => {
      localStorage.removeItem("jk_token");
    }),
  };
});

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("rendersNavigationLinks", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div>Page body</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Farms" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Assess" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compare" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Alerts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "History" })).toBeInTheDocument();
    expect(screen.getByText("Page body")).toBeInTheDocument();
  });

  test("logoutClearsTokenAndRedirects", async () => {
    const user = userEvent.setup();
    localStorage.setItem("jk_token", "x");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div>Page body</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(localStorage.getItem("jk_token")).toBeNull();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });
});
