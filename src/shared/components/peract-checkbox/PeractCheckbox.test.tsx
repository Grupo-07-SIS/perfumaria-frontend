import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PeractCheckbox } from "./index";

describe("PeractCheckbox", () => {
  it("supports keyboard selection and reports changes", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<PeractCheckbox aria-label="Selecionar produto" onCheckedChange={onCheckedChange} />);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Selecionar produto" })).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not change when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<PeractCheckbox aria-label="Selecionar produto" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("exposes indeterminate and invalid states", () => {
    render(<PeractCheckbox aria-label="Selecionar todos" checked="indeterminate" aria-invalid />);
    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });
});