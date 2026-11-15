import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/sheet";

describe("Peract sheet compatibility", () => {
  it("preserves Sheet", () => {
    expect(peract.PeractSheet).toBeDefined();
    expect(peract.PeractSheet).toBe(legacy.Sheet);
  });
  it("preserves SheetTrigger", () => {
    expect(peract.PeractSheetTrigger).toBeDefined();
    expect(peract.PeractSheetTrigger).toBe(legacy.SheetTrigger);
  });
  it("preserves SheetClose", () => {
    expect(peract.PeractSheetClose).toBeDefined();
    expect(peract.PeractSheetClose).toBe(legacy.SheetClose);
  });
  it("preserves SheetContent", () => {
    expect(peract.PeractSheetContent).toBeDefined();
    expect(peract.PeractSheetContent).toBe(legacy.SheetContent);
  });
  it("preserves SheetHeader", () => {
    expect(peract.PeractSheetHeader).toBeDefined();
    expect(peract.PeractSheetHeader).toBe(legacy.SheetHeader);
  });
  it("preserves SheetFooter", () => {
    expect(peract.PeractSheetFooter).toBeDefined();
    expect(peract.PeractSheetFooter).toBe(legacy.SheetFooter);
  });
  it("preserves SheetTitle", () => {
    expect(peract.PeractSheetTitle).toBeDefined();
    expect(peract.PeractSheetTitle).toBe(legacy.SheetTitle);
  });
  it("preserves SheetDescription", () => {
    expect(peract.PeractSheetDescription).toBeDefined();
    expect(peract.PeractSheetDescription).toBe(legacy.SheetDescription);
  });
});
