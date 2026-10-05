import * as React from "react";
import { cn } from "../../utils/cn";
function PeractCardPrimitive({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("peract-sans-font peract-bg-card text-card-foreground flex flex-col gap-6 peract-radius-xl border", className)} {...props} />;
}
function PeractCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("peract-sans-font @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className)} {...props} />;
}
function PeractCardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <h4 data-slot="card-title" className={cn("peract-sans-font leading-none", className)} {...props} />;
}
function PeractCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <p data-slot="card-description" className={cn("peract-sans-font peract-font-color-muted", className)} {...props} />;
}
function PeractCardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("peract-sans-font col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}
function PeractCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("peract-sans-font px-6 [&:last-child]:pb-6", className)} {...props} />;
}
function PeractCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("peract-sans-font flex items-center px-6 pb-6 [.border-t]:pt-6", className)} {...props} />;
}
export { PeractCardPrimitive, PeractCardHeader, PeractCardFooter, PeractCardTitle, PeractCardAction, PeractCardDescription, PeractCardContent };
