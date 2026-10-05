import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/input";

describe("Peract input compatibility", () => {
  it("preserves Input", () => {
    expect(peract.PeractInputControl).toBeDefined();
    expect(peract.PeractInputControl).toBe(legacy.Input);
  });
});
