import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/collapsible";

describe("Peract collapsible compatibility", () => {
  it("preserves Collapsible", () => {
    expect(peract.PeractCollapsible).toBeDefined();
    expect(peract.PeractCollapsible).toBe(legacy.Collapsible);
  });
  it("preserves CollapsibleTrigger", () => {
    expect(peract.PeractCollapsibleTrigger).toBeDefined();
    expect(peract.PeractCollapsibleTrigger).toBe(legacy.CollapsibleTrigger);
  });
  it("preserves CollapsibleContent", () => {
    expect(peract.PeractCollapsibleContent).toBeDefined();
    expect(peract.PeractCollapsibleContent).toBe(legacy.CollapsibleContent);
  });
});
