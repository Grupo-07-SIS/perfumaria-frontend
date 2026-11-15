import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/separator";

describe("Peract separator compatibility", () => {
  it("preserves Separator", () => {
    expect(peract.PeractSeparator).toBeDefined();
    expect(peract.PeractSeparator).toBe(legacy.Separator);
  });
});
