"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "../ui/utils";
function PeractDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}
function PeractDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
function PeractDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}
function PeractDialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}
function PeractDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn("peract-sans-font data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)} {...props} />;
}
function PeractDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return <PeractDialogPortal data-slot="dialog-portal">
      <PeractDialogOverlay />
      <DialogPrimitive.Content data-slot="dialog-content" className={cn("peract-sans-font peract-bg-page data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 peract-radius-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className)} {...props}>
        {children}
        <DialogPrimitive.Close className="peract-sans-font ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="peract-sans-font sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </PeractDialogPortal>;
}
function PeractDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("peract-sans-font flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}
function PeractDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("peract-sans-font flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}
function PeractDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("peract-sans-font text-lg leading-none font-semibold", className)} {...props} />;
}
function PeractDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("peract-sans-font peract-font-color-muted text-sm", className)} {...props} />;
}
export { PeractDialog, PeractDialogClose, PeractDialogContent, PeractDialogDescription, PeractDialogFooter, PeractDialogHeader, PeractDialogOverlay, PeractDialogPortal, PeractDialogTitle, PeractDialogTrigger };
