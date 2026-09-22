import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/scroll-area";

describe("Peract scroll-area compatibility", () => {
  it("preserves ScrollArea", () => {
    expect(peract.PeractScrollArea).toBeDefined();
    expect(peract.PeractScrollArea).toBe(legacy.ScrollArea);
  });
  it("preserves ScrollBar", () => {
    expect(peract.PeractScrollBar).toBeDefined();
    expect(peract.PeractScrollBar).toBe(legacy.ScrollBar);
  });
});
