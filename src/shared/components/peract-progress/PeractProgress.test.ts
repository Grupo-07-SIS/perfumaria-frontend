import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/progress";

describe("Peract progress compatibility", () => {
  it("preserves Progress", () => {
    expect(peract.PeractProgress).toBeDefined();
    expect(peract.PeractProgress).toBe(legacy.Progress);
  });
});
