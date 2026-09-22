import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/radio-group";

describe("Peract radio-group compatibility", () => {
  it("preserves RadioGroup", () => {
    expect(peract.PeractRadioGroup).toBeDefined();
    expect(peract.PeractRadioGroup).toBe(legacy.RadioGroup);
  });
  it("preserves RadioGroupItem", () => {
    expect(peract.PeractRadioGroupItem).toBeDefined();
    expect(peract.PeractRadioGroupItem).toBe(legacy.RadioGroupItem);
  });
});
