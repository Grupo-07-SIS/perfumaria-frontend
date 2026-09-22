import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/skeleton";

describe("Peract skeleton compatibility", () => {
  it("preserves Skeleton", () => {
    expect(peract.PeractSkeleton).toBeDefined();
    expect(peract.PeractSkeleton).toBe(legacy.Skeleton);
  });
});
