export { PeractTable } from "./PeractTable";
export type { PeractTableData, PeractTableProps } from "./PeractTable.types";
import { PeractTableHeader as TableHeaderPrimitive } from "./PeractTablePrimitives";

// Preserve both the legacy column type and the composable header component.
export type PeractTableHeader<TData> = import("./PeractTable.types").PeractTableHeader<TData>;
export const PeractTableHeader = TableHeaderPrimitive;

export {
  PeractTableRoot,
  PeractTableBody,
  PeractTableFooter,
  PeractTableHead,
  PeractTableRow,
  PeractTableCell,
  PeractTableCaption,
} from "./PeractTablePrimitives";
export type { PeractTableRootProps, PeractTableHeaderProps, PeractTableBodyProps, PeractTableFooterProps, PeractTableHeadProps, PeractTableRowProps, PeractTableCellProps, PeractTableCaptionProps } from "./PeractTablePrimitives.types";
