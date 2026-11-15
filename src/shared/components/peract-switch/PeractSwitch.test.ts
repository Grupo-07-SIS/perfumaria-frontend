import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/switch";

describe("Peract switch compatibility", () => {
  it("preserves Switch", () => {
    expect(peract.PeractSwitch).toBeDefined();
    expect(peract.PeractSwitch).toBe(legacy.Switch);
  });
});
