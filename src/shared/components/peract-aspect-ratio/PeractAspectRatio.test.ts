import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/aspect-ratio";

describe("Peract aspect-ratio compatibility", () => {
  it("preserves AspectRatio", () => {
    expect(peract.PeractAspectRatio).toBeDefined();
    expect(peract.PeractAspectRatio).toBe(legacy.AspectRatio);
  });
});
