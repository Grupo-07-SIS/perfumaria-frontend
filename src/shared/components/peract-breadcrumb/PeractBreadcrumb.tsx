import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../ui/utils";
function PeractBreadcrumb({
  ...props
}: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}
function PeractBreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn("peract-sans-font peract-font-color-muted flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5", className)} {...props} />;
}
function PeractBreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("peract-sans-font inline-flex items-center gap-1.5", className)} {...props} />;
}
function PeractBreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return <Comp data-slot="breadcrumb-link" className={cn("peract-sans-font hover:text-foreground transition-colors", className)} {...props} />;
}
function PeractBreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={cn("peract-sans-font peract-font-color-default font-normal", className)} {...props} />;
}
function PeractBreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("peract-sans-font [&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRight />}
    </li>;
}
function PeractBreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={cn("peract-sans-font flex size-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="peract-sans-font size-4" />
      <span className="peract-sans-font sr-only">More</span>
    </span>;
}
export { PeractBreadcrumb, PeractBreadcrumbList, PeractBreadcrumbItem, PeractBreadcrumbLink, PeractBreadcrumbPage, PeractBreadcrumbSeparator, PeractBreadcrumbEllipsis };
