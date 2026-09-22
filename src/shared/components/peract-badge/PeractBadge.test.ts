import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/badge";

describe("Peract badge compatibility", () => {
  it("preserves Badge", () => {
    expect(peract.PeractBadge).toBeDefined();
    expect(peract.PeractBadge).toBe(legacy.Badge);
  });
  it("preserves badgeVariants", () => {
    expect(peract.peractBadgeVariants).toBeDefined();
    expect(peract.peractBadgeVariants).toBe(legacy.badgeVariants);
  });
});
