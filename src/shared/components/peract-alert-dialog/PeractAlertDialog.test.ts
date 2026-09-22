import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/alert-dialog";

describe("Peract alert-dialog compatibility", () => {
  it("preserves AlertDialog", () => {
    expect(peract.PeractAlertDialog).toBeDefined();
    expect(peract.PeractAlertDialog).toBe(legacy.AlertDialog);
  });
  it("preserves AlertDialogPortal", () => {
    expect(peract.PeractAlertDialogPortal).toBeDefined();
    expect(peract.PeractAlertDialogPortal).toBe(legacy.AlertDialogPortal);
  });
  it("preserves AlertDialogOverlay", () => {
    expect(peract.PeractAlertDialogOverlay).toBeDefined();
    expect(peract.PeractAlertDialogOverlay).toBe(legacy.AlertDialogOverlay);
  });
  it("preserves AlertDialogTrigger", () => {
    expect(peract.PeractAlertDialogTrigger).toBeDefined();
    expect(peract.PeractAlertDialogTrigger).toBe(legacy.AlertDialogTrigger);
  });
  it("preserves AlertDialogContent", () => {
    expect(peract.PeractAlertDialogContent).toBeDefined();
    expect(peract.PeractAlertDialogContent).toBe(legacy.AlertDialogContent);
  });
  it("preserves AlertDialogHeader", () => {
    expect(peract.PeractAlertDialogHeader).toBeDefined();
    expect(peract.PeractAlertDialogHeader).toBe(legacy.AlertDialogHeader);
  });
  it("preserves AlertDialogFooter", () => {
    expect(peract.PeractAlertDialogFooter).toBeDefined();
    expect(peract.PeractAlertDialogFooter).toBe(legacy.AlertDialogFooter);
  });
  it("preserves AlertDialogTitle", () => {
    expect(peract.PeractAlertDialogTitle).toBeDefined();
    expect(peract.PeractAlertDialogTitle).toBe(legacy.AlertDialogTitle);
  });
  it("preserves AlertDialogDescription", () => {
    expect(peract.PeractAlertDialogDescription).toBeDefined();
    expect(peract.PeractAlertDialogDescription).toBe(legacy.AlertDialogDescription);
  });
  it("preserves AlertDialogAction", () => {
    expect(peract.PeractAlertDialogAction).toBeDefined();
    expect(peract.PeractAlertDialogAction).toBe(legacy.AlertDialogAction);
  });
  it("preserves AlertDialogCancel", () => {
    expect(peract.PeractAlertDialogCancel).toBeDefined();
    expect(peract.PeractAlertDialogCancel).toBe(legacy.AlertDialogCancel);
  });
});
