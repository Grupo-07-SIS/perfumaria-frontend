import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/drawer";

describe("Peract drawer compatibility", () => {
  it("preserves Drawer", () => {
    expect(peract.PeractDrawer).toBeDefined();
    expect(peract.PeractDrawer).toBe(legacy.Drawer);
  });
  it("preserves DrawerPortal", () => {
    expect(peract.PeractDrawerPortal).toBeDefined();
    expect(peract.PeractDrawerPortal).toBe(legacy.DrawerPortal);
  });
  it("preserves DrawerOverlay", () => {
    expect(peract.PeractDrawerOverlay).toBeDefined();
    expect(peract.PeractDrawerOverlay).toBe(legacy.DrawerOverlay);
  });
  it("preserves DrawerTrigger", () => {
    expect(peract.PeractDrawerTrigger).toBeDefined();
    expect(peract.PeractDrawerTrigger).toBe(legacy.DrawerTrigger);
  });
  it("preserves DrawerClose", () => {
    expect(peract.PeractDrawerClose).toBeDefined();
    expect(peract.PeractDrawerClose).toBe(legacy.DrawerClose);
  });
  it("preserves DrawerContent", () => {
    expect(peract.PeractDrawerContent).toBeDefined();
    expect(peract.PeractDrawerContent).toBe(legacy.DrawerContent);
  });
  it("preserves DrawerHeader", () => {
    expect(peract.PeractDrawerHeader).toBeDefined();
    expect(peract.PeractDrawerHeader).toBe(legacy.DrawerHeader);
  });
  it("preserves DrawerFooter", () => {
    expect(peract.PeractDrawerFooter).toBeDefined();
    expect(peract.PeractDrawerFooter).toBe(legacy.DrawerFooter);
  });
  it("preserves DrawerTitle", () => {
    expect(peract.PeractDrawerTitle).toBeDefined();
    expect(peract.PeractDrawerTitle).toBe(legacy.DrawerTitle);
  });
  it("preserves DrawerDescription", () => {
    expect(peract.PeractDrawerDescription).toBeDefined();
    expect(peract.PeractDrawerDescription).toBe(legacy.DrawerDescription);
  });
});
