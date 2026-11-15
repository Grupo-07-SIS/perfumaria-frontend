import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/navigation-menu";

describe("Peract navigation-menu compatibility", () => {
  it("preserves NavigationMenu", () => {
    expect(peract.PeractNavigationMenu).toBeDefined();
    expect(peract.PeractNavigationMenu).toBe(legacy.NavigationMenu);
  });
  it("preserves NavigationMenuList", () => {
    expect(peract.PeractNavigationMenuList).toBeDefined();
    expect(peract.PeractNavigationMenuList).toBe(legacy.NavigationMenuList);
  });
  it("preserves NavigationMenuItem", () => {
    expect(peract.PeractNavigationMenuItem).toBeDefined();
    expect(peract.PeractNavigationMenuItem).toBe(legacy.NavigationMenuItem);
  });
  it("preserves NavigationMenuContent", () => {
    expect(peract.PeractNavigationMenuContent).toBeDefined();
    expect(peract.PeractNavigationMenuContent).toBe(legacy.NavigationMenuContent);
  });
  it("preserves NavigationMenuTrigger", () => {
    expect(peract.PeractNavigationMenuTrigger).toBeDefined();
    expect(peract.PeractNavigationMenuTrigger).toBe(legacy.NavigationMenuTrigger);
  });
  it("preserves NavigationMenuLink", () => {
    expect(peract.PeractNavigationMenuLink).toBeDefined();
    expect(peract.PeractNavigationMenuLink).toBe(legacy.NavigationMenuLink);
  });
  it("preserves NavigationMenuIndicator", () => {
    expect(peract.PeractNavigationMenuIndicator).toBeDefined();
    expect(peract.PeractNavigationMenuIndicator).toBe(legacy.NavigationMenuIndicator);
  });
  it("preserves NavigationMenuViewport", () => {
    expect(peract.PeractNavigationMenuViewport).toBeDefined();
    expect(peract.PeractNavigationMenuViewport).toBe(legacy.NavigationMenuViewport);
  });
  it("preserves navigationMenuTriggerStyle", () => {
    expect(peract.peractNavigationMenuTriggerStyle).toBeDefined();
    expect(peract.peractNavigationMenuTriggerStyle).toBe(legacy.navigationMenuTriggerStyle);
  });
});
