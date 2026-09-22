import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/tooltip";

describe("Peract tooltip compatibility", () => {
  it("preserves Tooltip", () => {
    expect(peract.PeractTooltip).toBeDefined();
    expect(peract.PeractTooltip).toBe(legacy.Tooltip);
  });
  it("preserves TooltipTrigger", () => {
    expect(peract.PeractTooltipTrigger).toBeDefined();
    expect(peract.PeractTooltipTrigger).toBe(legacy.TooltipTrigger);
  });
  it("preserves TooltipContent", () => {
    expect(peract.PeractTooltipContent).toBeDefined();
    expect(peract.PeractTooltipContent).toBe(legacy.TooltipContent);
  });
  it("preserves TooltipProvider", () => {
    expect(peract.PeractTooltipProvider).toBeDefined();
    expect(peract.PeractTooltipProvider).toBe(legacy.TooltipProvider);
  });
});
