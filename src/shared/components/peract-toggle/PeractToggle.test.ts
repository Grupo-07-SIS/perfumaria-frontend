import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/toggle";

describe("Peract toggle compatibility", () => {
  it("preserves Toggle", () => {
    expect(peract.PeractToggle).toBeDefined();
    expect(peract.PeractToggle).toBe(legacy.Toggle);
  });
  it("preserves toggleVariants", () => {
    expect(peract.peractToggleVariants).toBeDefined();
    expect(peract.peractToggleVariants).toBe(legacy.toggleVariants);
  });
});
