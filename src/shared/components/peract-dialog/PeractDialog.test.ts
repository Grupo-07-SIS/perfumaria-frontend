import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/dialog";

describe("Peract dialog compatibility", () => {
  it("preserves Dialog", () => {
    expect(peract.PeractDialog).toBeDefined();
    expect(peract.PeractDialog).toBe(legacy.Dialog);
  });
  it("preserves DialogClose", () => {
    expect(peract.PeractDialogClose).toBeDefined();
    expect(peract.PeractDialogClose).toBe(legacy.DialogClose);
  });
  it("preserves DialogContent", () => {
    expect(peract.PeractDialogContent).toBeDefined();
    expect(peract.PeractDialogContent).toBe(legacy.DialogContent);
  });
  it("preserves DialogDescription", () => {
    expect(peract.PeractDialogDescription).toBeDefined();
    expect(peract.PeractDialogDescription).toBe(legacy.DialogDescription);
  });
  it("preserves DialogFooter", () => {
    expect(peract.PeractDialogFooter).toBeDefined();
    expect(peract.PeractDialogFooter).toBe(legacy.DialogFooter);
  });
  it("preserves DialogHeader", () => {
    expect(peract.PeractDialogHeader).toBeDefined();
    expect(peract.PeractDialogHeader).toBe(legacy.DialogHeader);
  });
  it("preserves DialogOverlay", () => {
    expect(peract.PeractDialogOverlay).toBeDefined();
    expect(peract.PeractDialogOverlay).toBe(legacy.DialogOverlay);
  });
  it("preserves DialogPortal", () => {
    expect(peract.PeractDialogPortal).toBeDefined();
    expect(peract.PeractDialogPortal).toBe(legacy.DialogPortal);
  });
  it("preserves DialogTitle", () => {
    expect(peract.PeractDialogTitle).toBeDefined();
    expect(peract.PeractDialogTitle).toBe(legacy.DialogTitle);
  });
  it("preserves DialogTrigger", () => {
    expect(peract.PeractDialogTrigger).toBeDefined();
    expect(peract.PeractDialogTrigger).toBe(legacy.DialogTrigger);
  });
});
