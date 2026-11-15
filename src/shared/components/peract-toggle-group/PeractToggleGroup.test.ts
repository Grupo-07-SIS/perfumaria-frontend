import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/toggle-group";

describe("Peract toggle-group compatibility", () => {
  it("preserves ToggleGroup", () => {
    expect(peract.PeractToggleGroup).toBeDefined();
    expect(peract.PeractToggleGroup).toBe(legacy.ToggleGroup);
  });
  it("preserves ToggleGroupItem", () => {
    expect(peract.PeractToggleGroupItem).toBeDefined();
    expect(peract.PeractToggleGroupItem).toBe(legacy.ToggleGroupItem);
  });
});
