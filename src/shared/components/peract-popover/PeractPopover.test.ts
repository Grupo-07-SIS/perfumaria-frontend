import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/popover";

describe("Peract popover compatibility", () => {
  it("preserves Popover", () => {
    expect(peract.PeractPopover).toBeDefined();
    expect(peract.PeractPopover).toBe(legacy.Popover);
  });
  it("preserves PopoverTrigger", () => {
    expect(peract.PeractPopoverTrigger).toBeDefined();
    expect(peract.PeractPopoverTrigger).toBe(legacy.PopoverTrigger);
  });
  it("preserves PopoverContent", () => {
    expect(peract.PeractPopoverContent).toBeDefined();
    expect(peract.PeractPopoverContent).toBe(legacy.PopoverContent);
  });
  it("preserves PopoverAnchor", () => {
    expect(peract.PeractPopoverAnchor).toBeDefined();
    expect(peract.PeractPopoverAnchor).toBe(legacy.PopoverAnchor);
  });
});
