import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/sidebar";

describe("Peract sidebar compatibility", () => {
  it("preserves Sidebar", () => {
    expect(peract.PeractSidebar).toBeDefined();
    expect(peract.PeractSidebar).toBe(legacy.Sidebar);
  });
  it("preserves SidebarContent", () => {
    expect(peract.PeractSidebarContent).toBeDefined();
    expect(peract.PeractSidebarContent).toBe(legacy.SidebarContent);
  });
  it("preserves SidebarFooter", () => {
    expect(peract.PeractSidebarFooter).toBeDefined();
    expect(peract.PeractSidebarFooter).toBe(legacy.SidebarFooter);
  });
  it("preserves SidebarGroup", () => {
    expect(peract.PeractSidebarGroup).toBeDefined();
    expect(peract.PeractSidebarGroup).toBe(legacy.SidebarGroup);
  });
  it("preserves SidebarGroupAction", () => {
    expect(peract.PeractSidebarGroupAction).toBeDefined();
    expect(peract.PeractSidebarGroupAction).toBe(legacy.SidebarGroupAction);
  });
  it("preserves SidebarGroupContent", () => {
    expect(peract.PeractSidebarGroupContent).toBeDefined();
    expect(peract.PeractSidebarGroupContent).toBe(legacy.SidebarGroupContent);
  });
  it("preserves SidebarGroupLabel", () => {
    expect(peract.PeractSidebarGroupLabel).toBeDefined();
    expect(peract.PeractSidebarGroupLabel).toBe(legacy.SidebarGroupLabel);
  });
  it("preserves SidebarHeader", () => {
    expect(peract.PeractSidebarHeader).toBeDefined();
    expect(peract.PeractSidebarHeader).toBe(legacy.SidebarHeader);
  });
  it("preserves SidebarInput", () => {
    expect(peract.PeractSidebarInput).toBeDefined();
    expect(peract.PeractSidebarInput).toBe(legacy.SidebarInput);
  });
  it("preserves SidebarInset", () => {
    expect(peract.PeractSidebarInset).toBeDefined();
    expect(peract.PeractSidebarInset).toBe(legacy.SidebarInset);
  });
  it("preserves SidebarMenu", () => {
    expect(peract.PeractSidebarMenu).toBeDefined();
    expect(peract.PeractSidebarMenu).toBe(legacy.SidebarMenu);
  });
  it("preserves SidebarMenuAction", () => {
    expect(peract.PeractSidebarMenuAction).toBeDefined();
    expect(peract.PeractSidebarMenuAction).toBe(legacy.SidebarMenuAction);
  });
  it("preserves SidebarMenuBadge", () => {
    expect(peract.PeractSidebarMenuBadge).toBeDefined();
    expect(peract.PeractSidebarMenuBadge).toBe(legacy.SidebarMenuBadge);
  });
  it("preserves SidebarMenuButton", () => {
    expect(peract.PeractSidebarMenuButton).toBeDefined();
    expect(peract.PeractSidebarMenuButton).toBe(legacy.SidebarMenuButton);
  });
  it("preserves SidebarMenuItem", () => {
    expect(peract.PeractSidebarMenuItem).toBeDefined();
    expect(peract.PeractSidebarMenuItem).toBe(legacy.SidebarMenuItem);
  });
  it("preserves SidebarMenuSkeleton", () => {
    expect(peract.PeractSidebarMenuSkeleton).toBeDefined();
    expect(peract.PeractSidebarMenuSkeleton).toBe(legacy.SidebarMenuSkeleton);
  });
  it("preserves SidebarMenuSub", () => {
    expect(peract.PeractSidebarMenuSub).toBeDefined();
    expect(peract.PeractSidebarMenuSub).toBe(legacy.SidebarMenuSub);
  });
  it("preserves SidebarMenuSubButton", () => {
    expect(peract.PeractSidebarMenuSubButton).toBeDefined();
    expect(peract.PeractSidebarMenuSubButton).toBe(legacy.SidebarMenuSubButton);
  });
  it("preserves SidebarMenuSubItem", () => {
    expect(peract.PeractSidebarMenuSubItem).toBeDefined();
    expect(peract.PeractSidebarMenuSubItem).toBe(legacy.SidebarMenuSubItem);
  });
  it("preserves SidebarProvider", () => {
    expect(peract.PeractSidebarProvider).toBeDefined();
    expect(peract.PeractSidebarProvider).toBe(legacy.SidebarProvider);
  });
  it("preserves SidebarRail", () => {
    expect(peract.PeractSidebarRail).toBeDefined();
    expect(peract.PeractSidebarRail).toBe(legacy.SidebarRail);
  });
  it("preserves SidebarSeparator", () => {
    expect(peract.PeractSidebarSeparator).toBeDefined();
    expect(peract.PeractSidebarSeparator).toBe(legacy.SidebarSeparator);
  });
  it("preserves SidebarTrigger", () => {
    expect(peract.PeractSidebarTrigger).toBeDefined();
    expect(peract.PeractSidebarTrigger).toBe(legacy.SidebarTrigger);
  });
  it("preserves useSidebar", () => {
    expect(peract.usePeractSidebar).toBeDefined();
    expect(peract.usePeractSidebar).toBe(legacy.useSidebar);
  });
});
