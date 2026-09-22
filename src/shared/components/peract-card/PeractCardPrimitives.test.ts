import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/card";

describe("Peract card compatibility", () => {
  it("preserves Card", () => {
    expect(peract.PeractCardPrimitive).toBeDefined();
    expect(peract.PeractCardPrimitive).toBe(legacy.Card);
  });
  it("preserves CardHeader", () => {
    expect(peract.PeractCardHeader).toBeDefined();
    expect(peract.PeractCardHeader).toBe(legacy.CardHeader);
  });
  it("preserves CardFooter", () => {
    expect(peract.PeractCardFooter).toBeDefined();
    expect(peract.PeractCardFooter).toBe(legacy.CardFooter);
  });
  it("preserves CardTitle", () => {
    expect(peract.PeractCardTitle).toBeDefined();
    expect(peract.PeractCardTitle).toBe(legacy.CardTitle);
  });
  it("preserves CardAction", () => {
    expect(peract.PeractCardAction).toBeDefined();
    expect(peract.PeractCardAction).toBe(legacy.CardAction);
  });
  it("preserves CardDescription", () => {
    expect(peract.PeractCardDescription).toBeDefined();
    expect(peract.PeractCardDescription).toBe(legacy.CardDescription);
  });
  it("preserves CardContent", () => {
    expect(peract.PeractCardContent).toBeDefined();
    expect(peract.PeractCardContent).toBe(legacy.CardContent);
  });
});
