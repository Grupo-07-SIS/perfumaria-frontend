"use client";

import * as React from "react";
import { cn } from "../../utils/cn";
function PeractTableRoot({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return <div data-slot="table-container" className="peract-sans-font relative w-full overflow-x-auto">
      <table data-slot="table" className={cn("peract-sans-font w-full caption-bottom text-sm", className)} {...props} />
    </div>;
}
function PeractTableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("peract-sans-font [&_tr]:border-b", className)} {...props} />;
}
function PeractTableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("peract-sans-font [&_tr:last-child]:border-0", className)} {...props} />;
}
function PeractTableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("peract-sans-font bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)} {...props} />;
}
function PeractTableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("peract-sans-font hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)} {...props} />;
}
function PeractTableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return <th data-slot="table-head" className={cn("peract-sans-font peract-font-color-default h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props} />;
}
function PeractTableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("peract-sans-font p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props} />;
}
function PeractTableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("peract-sans-font peract-font-color-muted mt-4 text-sm", className)} {...props} />;
}
export { PeractTableRoot, PeractTableHeader, PeractTableBody, PeractTableFooter, PeractTableHead, PeractTableRow, PeractTableCell, PeractTableCaption };
