"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../ui/utils";
function PeractAvatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn("peract-sans-font relative flex size-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}
function PeractAvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("peract-sans-font aspect-square size-full", className)} {...props} />;
}
function PeractAvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn("peract-sans-font bg-muted flex size-full items-center justify-center rounded-full", className)} {...props} />;
}
export { PeractAvatar, PeractAvatarImage, PeractAvatarFallback };
