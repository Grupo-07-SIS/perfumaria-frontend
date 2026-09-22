"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { PeractDialog as Dialog, PeractDialogContent as DialogContent, PeractDialogDescription as DialogDescription, PeractDialogHeader as DialogHeader, PeractDialogTitle as DialogTitle } from "../peract-dialog";
function PeractCommand({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn("peract-sans-font bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden peract-radius-md", className)} {...props} />;
}
function PeractCommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return <Dialog {...props}>
      <DialogHeader className="peract-sans-font sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="peract-sans-font overflow-hidden p-0">
        <PeractCommand className="peract-sans-font [&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </PeractCommand>
      </DialogContent>
    </Dialog>;
}
function PeractCommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return <div data-slot="command-input-wrapper" className="peract-sans-font flex h-9 items-center gap-2 border-b px-3">
      <SearchIcon className="peract-sans-font size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input data-slot="command-input" className={cn("peract-sans-font placeholder:text-muted-foreground flex h-10 w-full peract-radius-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
    </div>;
}
function PeractCommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn("peract-sans-font max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)} {...props} />;
}
function PeractCommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className="peract-sans-font py-6 text-center text-sm" {...props} />;
}
function PeractCommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group data-slot="command-group" className={cn("peract-sans-font peract-font-color-default [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium", className)} {...props} />;
}
function PeractCommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("peract-sans-font bg-border -mx-1 h-px", className)} {...props} />;
}
function PeractCommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item data-slot="command-item" className={cn("peract-sans-font data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props} />;
}
function PeractCommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className={cn("peract-sans-font peract-font-color-muted ml-auto text-xs tracking-widest", className)} {...props} />;
}
export { PeractCommand, PeractCommandDialog, PeractCommandInput, PeractCommandList, PeractCommandEmpty, PeractCommandGroup, PeractCommandItem, PeractCommandShortcut, PeractCommandSeparator };
