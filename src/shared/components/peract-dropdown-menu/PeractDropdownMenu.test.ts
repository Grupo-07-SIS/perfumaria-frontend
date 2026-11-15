import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/dropdown-menu";

describe("Peract dropdown-menu compatibility", () => {
  it("preserves DropdownMenu", () => {
    expect(peract.PeractDropdownMenu).toBeDefined();
    expect(peract.PeractDropdownMenu).toBe(legacy.DropdownMenu);
  });
  it("preserves DropdownMenuPortal", () => {
    expect(peract.PeractDropdownMenuPortal).toBeDefined();
    expect(peract.PeractDropdownMenuPortal).toBe(legacy.DropdownMenuPortal);
  });
  it("preserves DropdownMenuTrigger", () => {
    expect(peract.PeractDropdownMenuTrigger).toBeDefined();
    expect(peract.PeractDropdownMenuTrigger).toBe(legacy.DropdownMenuTrigger);
  });
  it("preserves DropdownMenuContent", () => {
    expect(peract.PeractDropdownMenuContent).toBeDefined();
    expect(peract.PeractDropdownMenuContent).toBe(legacy.DropdownMenuContent);
  });
  it("preserves DropdownMenuGroup", () => {
    expect(peract.PeractDropdownMenuGroup).toBeDefined();
    expect(peract.PeractDropdownMenuGroup).toBe(legacy.DropdownMenuGroup);
  });
  it("preserves DropdownMenuLabel", () => {
    expect(peract.PeractDropdownMenuLabel).toBeDefined();
    expect(peract.PeractDropdownMenuLabel).toBe(legacy.DropdownMenuLabel);
  });
  it("preserves DropdownMenuItem", () => {
    expect(peract.PeractDropdownMenuItem).toBeDefined();
    expect(peract.PeractDropdownMenuItem).toBe(legacy.DropdownMenuItem);
  });
  it("preserves DropdownMenuCheckboxItem", () => {
    expect(peract.PeractDropdownMenuCheckboxItem).toBeDefined();
    expect(peract.PeractDropdownMenuCheckboxItem).toBe(legacy.DropdownMenuCheckboxItem);
  });
  it("preserves DropdownMenuRadioGroup", () => {
    expect(peract.PeractDropdownMenuRadioGroup).toBeDefined();
    expect(peract.PeractDropdownMenuRadioGroup).toBe(legacy.DropdownMenuRadioGroup);
  });
  it("preserves DropdownMenuRadioItem", () => {
    expect(peract.PeractDropdownMenuRadioItem).toBeDefined();
    expect(peract.PeractDropdownMenuRadioItem).toBe(legacy.DropdownMenuRadioItem);
  });
  it("preserves DropdownMenuSeparator", () => {
    expect(peract.PeractDropdownMenuSeparator).toBeDefined();
    expect(peract.PeractDropdownMenuSeparator).toBe(legacy.DropdownMenuSeparator);
  });
  it("preserves DropdownMenuShortcut", () => {
    expect(peract.PeractDropdownMenuShortcut).toBeDefined();
    expect(peract.PeractDropdownMenuShortcut).toBe(legacy.DropdownMenuShortcut);
  });
  it("preserves DropdownMenuSub", () => {
    expect(peract.PeractDropdownMenuSub).toBeDefined();
    expect(peract.PeractDropdownMenuSub).toBe(legacy.DropdownMenuSub);
  });
  it("preserves DropdownMenuSubTrigger", () => {
    expect(peract.PeractDropdownMenuSubTrigger).toBeDefined();
    expect(peract.PeractDropdownMenuSubTrigger).toBe(legacy.DropdownMenuSubTrigger);
  });
  it("preserves DropdownMenuSubContent", () => {
    expect(peract.PeractDropdownMenuSubContent).toBeDefined();
    expect(peract.PeractDropdownMenuSubContent).toBe(legacy.DropdownMenuSubContent);
  });
});
