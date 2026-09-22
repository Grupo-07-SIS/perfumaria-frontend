import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/context-menu";

describe("Peract context-menu compatibility", () => {
  it("preserves ContextMenu", () => {
    expect(peract.PeractContextMenu).toBeDefined();
    expect(peract.PeractContextMenu).toBe(legacy.ContextMenu);
  });
  it("preserves ContextMenuTrigger", () => {
    expect(peract.PeractContextMenuTrigger).toBeDefined();
    expect(peract.PeractContextMenuTrigger).toBe(legacy.ContextMenuTrigger);
  });
  it("preserves ContextMenuContent", () => {
    expect(peract.PeractContextMenuContent).toBeDefined();
    expect(peract.PeractContextMenuContent).toBe(legacy.ContextMenuContent);
  });
  it("preserves ContextMenuItem", () => {
    expect(peract.PeractContextMenuItem).toBeDefined();
    expect(peract.PeractContextMenuItem).toBe(legacy.ContextMenuItem);
  });
  it("preserves ContextMenuCheckboxItem", () => {
    expect(peract.PeractContextMenuCheckboxItem).toBeDefined();
    expect(peract.PeractContextMenuCheckboxItem).toBe(legacy.ContextMenuCheckboxItem);
  });
  it("preserves ContextMenuRadioItem", () => {
    expect(peract.PeractContextMenuRadioItem).toBeDefined();
    expect(peract.PeractContextMenuRadioItem).toBe(legacy.ContextMenuRadioItem);
  });
  it("preserves ContextMenuLabel", () => {
    expect(peract.PeractContextMenuLabel).toBeDefined();
    expect(peract.PeractContextMenuLabel).toBe(legacy.ContextMenuLabel);
  });
  it("preserves ContextMenuSeparator", () => {
    expect(peract.PeractContextMenuSeparator).toBeDefined();
    expect(peract.PeractContextMenuSeparator).toBe(legacy.ContextMenuSeparator);
  });
  it("preserves ContextMenuShortcut", () => {
    expect(peract.PeractContextMenuShortcut).toBeDefined();
    expect(peract.PeractContextMenuShortcut).toBe(legacy.ContextMenuShortcut);
  });
  it("preserves ContextMenuGroup", () => {
    expect(peract.PeractContextMenuGroup).toBeDefined();
    expect(peract.PeractContextMenuGroup).toBe(legacy.ContextMenuGroup);
  });
  it("preserves ContextMenuPortal", () => {
    expect(peract.PeractContextMenuPortal).toBeDefined();
    expect(peract.PeractContextMenuPortal).toBe(legacy.ContextMenuPortal);
  });
  it("preserves ContextMenuSub", () => {
    expect(peract.PeractContextMenuSub).toBeDefined();
    expect(peract.PeractContextMenuSub).toBe(legacy.ContextMenuSub);
  });
  it("preserves ContextMenuSubContent", () => {
    expect(peract.PeractContextMenuSubContent).toBeDefined();
    expect(peract.PeractContextMenuSubContent).toBe(legacy.ContextMenuSubContent);
  });
  it("preserves ContextMenuSubTrigger", () => {
    expect(peract.PeractContextMenuSubTrigger).toBeDefined();
    expect(peract.PeractContextMenuSubTrigger).toBe(legacy.ContextMenuSubTrigger);
  });
  it("preserves ContextMenuRadioGroup", () => {
    expect(peract.PeractContextMenuRadioGroup).toBeDefined();
    expect(peract.PeractContextMenuRadioGroup).toBe(legacy.ContextMenuRadioGroup);
  });
});
