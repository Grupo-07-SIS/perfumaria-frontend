"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../ui/utils";
import { peractButtonVariants as buttonVariants } from "../peract-button";
function PeractAlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}
function PeractAlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}
function PeractAlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}
function PeractAlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={cn("peract-sans-font data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)} {...props} />;
}
function PeractAlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return <PeractAlertDialogPortal>
      <PeractAlertDialogOverlay />
      <AlertDialogPrimitive.Content data-slot="alert-dialog-content" className={cn("peract-sans-font peract-bg-page data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 peract-radius-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className)} {...props} />
    </PeractAlertDialogPortal>;
}
function PeractAlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("peract-sans-font flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}
function PeractAlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn("peract-sans-font flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}
function PeractAlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("peract-sans-font text-lg font-semibold", className)} {...props} />;
}
function PeractAlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("peract-sans-font peract-font-color-muted text-sm", className)} {...props} />;
}
function PeractAlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />;
}
function PeractAlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel className={cn(buttonVariants({
    variant: "outline"
  }), className)} {...props} />;
}
export { PeractAlertDialog, PeractAlertDialogPortal, PeractAlertDialogOverlay, PeractAlertDialogTrigger, PeractAlertDialogContent, PeractAlertDialogHeader, PeractAlertDialogFooter, PeractAlertDialogTitle, PeractAlertDialogDescription, PeractAlertDialogAction, PeractAlertDialogCancel };
