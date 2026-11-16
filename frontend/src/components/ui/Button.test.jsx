import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("rendersVariantAndText", () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveAttribute("data-variant", "danger");
  });

  test("loadingDisablesTheButton", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  test("callsOnClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });

    const user = userEvent.setup();
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("clickWithDisabledDoesNotCallHandler", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Click me" });

    const user = userEvent.setup();
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
