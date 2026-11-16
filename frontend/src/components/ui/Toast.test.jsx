import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  queryByText,
  getByRole,
  queryByRole,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "./Toast";

function Probe() {
  const toast = useToast();
  return (
    <div>
      <button type="button" onClick={() => toast.success("Farm added")}>
        ok
      </button>
      <button type="button" onClick={() => toast.error("Could not save")}>
        bad
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("showsASuccessToast", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "ok" }));
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveTextContent("Farm added");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("autoDismisses", async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    await act(async () => {
      screen.getByRole("button", { name: "ok" }).click();
    });
    act(() => {
      vi.advanceTimersByTime(4100);
    });
    expect(screen.queryByText("Farm added")).toBeNull();
    vi.useRealTimers();
  });

  it("dismissButtonRemovesIt", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "ok" }));
    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );
    expect(screen.queryByText("Farm added")).toBeNull();
  });

  it("errorsUseTheAlertRole", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "bad" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
  });

  it("worksWithoutAProvider", async () => {
    const user = userEvent.setup();
    render(<Probe />);
    await user.click(screen.getByRole("button", { name: "ok" }));
    expect(screen.queryByRole("region", { name: "Notifications" })).toBeNull();
  });
});
