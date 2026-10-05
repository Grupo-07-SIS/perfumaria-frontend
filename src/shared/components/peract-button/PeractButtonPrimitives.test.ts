import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/button";

describe("Peract button compatibility", () => {
  it("preserves Button", () => {
    expect(peract.PeractButtonPrimitive).toBeDefined();
    expect(peract.PeractButtonPrimitive).toBe(legacy.Button);
  });
  it("preserves buttonVariants", () => {
    expect(peract.peractButtonVariants).toBeDefined();
    expect(peract.peractButtonVariants).toBe(legacy.buttonVariants);
  });
});
