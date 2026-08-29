import { type ReactNode } from "react";

export interface PeractTableHeader<TData> {
  name: string;
  orderColumn?: boolean;
  value: keyof TData | string;
}

export interface PeractTableData {
  id: string | number;
}

export interface PeractTableProps<TData extends PeractTableData> {
  data: TData[];
  emptyState?: ReactNode;
  footer?: ReactNode;
  header: Array<PeractTableHeader<TData>>;
  maxRows?: number;
  onOrderColumn?: (value: keyof TData | string) => void;
  renderHeaderLabel?: (header: PeractTableHeader<TData>) => ReactNode;
  renderRow: (row: TData) => ReactNode;
}