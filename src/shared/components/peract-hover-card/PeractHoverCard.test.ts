import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/hover-card";

describe("Peract hover-card compatibility", () => {
  it("preserves HoverCard", () => {
    expect(peract.PeractHoverCard).toBeDefined();
    expect(peract.PeractHoverCard).toBe(legacy.HoverCard);
  });
  it("preserves HoverCardTrigger", () => {
    expect(peract.PeractHoverCardTrigger).toBeDefined();
    expect(peract.PeractHoverCardTrigger).toBe(legacy.HoverCardTrigger);
  });
  it("preserves HoverCardContent", () => {
    expect(peract.PeractHoverCardContent).toBeDefined();
    expect(peract.PeractHoverCardContent).toBe(legacy.HoverCardContent);
  });
});
