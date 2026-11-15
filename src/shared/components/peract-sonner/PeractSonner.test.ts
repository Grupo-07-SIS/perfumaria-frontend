import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/sonner";

describe("Peract sonner compatibility", () => {
  it("preserves Toaster", () => {
    expect(peract.PeractToaster).toBeDefined();
    expect(peract.PeractToaster).toBe(legacy.Toaster);
  });
});
