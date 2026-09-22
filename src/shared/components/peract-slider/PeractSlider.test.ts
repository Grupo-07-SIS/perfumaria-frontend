import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/slider";

describe("Peract slider compatibility", () => {
  it("preserves Slider", () => {
    expect(peract.PeractSlider).toBeDefined();
    expect(peract.PeractSlider).toBe(legacy.Slider);
  });
});
