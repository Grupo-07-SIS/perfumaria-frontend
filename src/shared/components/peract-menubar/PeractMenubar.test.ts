import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/menubar";

describe("Peract menubar compatibility", () => {
  it("preserves Menubar", () => {
    expect(peract.PeractMenubar).toBeDefined();
    expect(peract.PeractMenubar).toBe(legacy.Menubar);
  });
  it("preserves MenubarPortal", () => {
    expect(peract.PeractMenubarPortal).toBeDefined();
    expect(peract.PeractMenubarPortal).toBe(legacy.MenubarPortal);
  });
  it("preserves MenubarMenu", () => {
    expect(peract.PeractMenubarMenu).toBeDefined();
    expect(peract.PeractMenubarMenu).toBe(legacy.MenubarMenu);
  });
  it("preserves MenubarTrigger", () => {
    expect(peract.PeractMenubarTrigger).toBeDefined();
    expect(peract.PeractMenubarTrigger).toBe(legacy.MenubarTrigger);
  });
  it("preserves MenubarContent", () => {
    expect(peract.PeractMenubarContent).toBeDefined();
    expect(peract.PeractMenubarContent).toBe(legacy.MenubarContent);
  });
  it("preserves MenubarGroup", () => {
    expect(peract.PeractMenubarGroup).toBeDefined();
    expect(peract.PeractMenubarGroup).toBe(legacy.MenubarGroup);
  });
  it("preserves MenubarSeparator", () => {
    expect(peract.PeractMenubarSeparator).toBeDefined();
    expect(peract.PeractMenubarSeparator).toBe(legacy.MenubarSeparator);
  });
  it("preserves MenubarLabel", () => {
    expect(peract.PeractMenubarLabel).toBeDefined();
    expect(peract.PeractMenubarLabel).toBe(legacy.MenubarLabel);
  });
  it("preserves MenubarItem", () => {
    expect(peract.PeractMenubarItem).toBeDefined();
    expect(peract.PeractMenubarItem).toBe(legacy.MenubarItem);
  });
  it("preserves MenubarShortcut", () => {
    expect(peract.PeractMenubarShortcut).toBeDefined();
    expect(peract.PeractMenubarShortcut).toBe(legacy.MenubarShortcut);
  });
  it("preserves MenubarCheckboxItem", () => {
    expect(peract.PeractMenubarCheckboxItem).toBeDefined();
    expect(peract.PeractMenubarCheckboxItem).toBe(legacy.MenubarCheckboxItem);
  });
  it("preserves MenubarRadioGroup", () => {
    expect(peract.PeractMenubarRadioGroup).toBeDefined();
    expect(peract.PeractMenubarRadioGroup).toBe(legacy.MenubarRadioGroup);
  });
  it("preserves MenubarRadioItem", () => {
    expect(peract.PeractMenubarRadioItem).toBeDefined();
    expect(peract.PeractMenubarRadioItem).toBe(legacy.MenubarRadioItem);
  });
  it("preserves MenubarSub", () => {
    expect(peract.PeractMenubarSub).toBeDefined();
    expect(peract.PeractMenubarSub).toBe(legacy.MenubarSub);
  });
  it("preserves MenubarSubTrigger", () => {
    expect(peract.PeractMenubarSubTrigger).toBeDefined();
    expect(peract.PeractMenubarSubTrigger).toBe(legacy.MenubarSubTrigger);
  });
  it("preserves MenubarSubContent", () => {
    expect(peract.PeractMenubarSubContent).toBeDefined();
    expect(peract.PeractMenubarSubContent).toBe(legacy.MenubarSubContent);
  });
});
