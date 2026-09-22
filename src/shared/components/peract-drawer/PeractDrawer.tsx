"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "../ui/utils";
function PeractDrawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}
function PeractDrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}
function PeractDrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}
function PeractDrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}
function PeractDrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={cn("peract-sans-font data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)} {...props} />;
}
function PeractDrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return <PeractDrawerPortal data-slot="drawer-portal">
      <PeractDrawerOverlay />
      <DrawerPrimitive.Content data-slot="drawer-content" className={cn("peract-sans-font group/drawer-content peract-bg-page fixed z-50 flex h-auto flex-col", "peract-sans-font data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b", "peract-sans-font data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t", "peract-sans-font data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm", "peract-sans-font data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm", className)} {...props}>
        <div className="peract-sans-font bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </PeractDrawerPortal>;
}
function PeractDrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="drawer-header" className={cn("peract-sans-font flex flex-col gap-1.5 p-4", className)} {...props} />;
}
function PeractDrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="drawer-footer" className={cn("peract-sans-font mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}
function PeractDrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("peract-sans-font peract-font-color-default font-semibold", className)} {...props} />;
}
function PeractDrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("peract-sans-font peract-font-color-muted text-sm", className)} {...props} />;
}
export { PeractDrawer, PeractDrawerPortal, PeractDrawerOverlay, PeractDrawerTrigger, PeractDrawerClose, PeractDrawerContent, PeractDrawerHeader, PeractDrawerFooter, PeractDrawerTitle, PeractDrawerDescription };
