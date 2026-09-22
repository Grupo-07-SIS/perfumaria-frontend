import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { PeractButtonPrimitive as Button, peractButtonVariants as buttonVariants } from "../peract-button";
function PeractPaginationRoot({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return <nav role="navigation" aria-label="pagination" data-slot="pagination" className={cn("peract-sans-font mx-auto flex w-full justify-center", className)} {...props} />;
}
function PeractPaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("peract-sans-font flex flex-row items-center gap-1", className)} {...props} />;
}
function PeractPaginationItem({
  ...props
}: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> & React.ComponentProps<"a">;
function PeractPaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return <a aria-current={isActive ? "page" : undefined} data-slot="pagination-link" data-active={isActive} className={cn(buttonVariants({
    variant: isActive ? "outline" : "ghost",
    size
  }), className)} {...props} />;
}
function PeractPaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PeractPaginationLink>) {
  return <PeractPaginationLink aria-label="Go to previous page" size="default" className={cn("peract-sans-font gap-1 px-2.5 sm:pl-2.5", className)} {...props}>
      <ChevronLeftIcon />
      <span className="peract-sans-font hidden sm:block">Previous</span>
    </PeractPaginationLink>;
}
function PeractPaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PeractPaginationLink>) {
  return <PeractPaginationLink aria-label="Go to next page" size="default" className={cn("peract-sans-font gap-1 px-2.5 sm:pr-2.5", className)} {...props}>
      <span className="peract-sans-font hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PeractPaginationLink>;
}
function PeractPaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span aria-hidden data-slot="pagination-ellipsis" className={cn("peract-sans-font flex size-9 items-center justify-center", className)} {...props}>
      <MoreHorizontalIcon className="peract-sans-font size-4" />
      <span className="peract-sans-font sr-only">More pages</span>
    </span>;
}
export { PeractPaginationRoot, PeractPaginationContent, PeractPaginationLink, PeractPaginationItem, PeractPaginationPrevious, PeractPaginationNext, PeractPaginationEllipsis };
