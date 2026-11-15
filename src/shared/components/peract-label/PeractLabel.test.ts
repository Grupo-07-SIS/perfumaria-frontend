import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/label";

describe("Peract label compatibility", () => {
  it("preserves Label", () => {
    expect(peract.PeractLabel).toBeDefined();
    expect(peract.PeractLabel).toBe(legacy.Label);
  });
});
