import type { ReactNode } from "react";

export interface PeractChipData {
  label?: string;
  selected: boolean;
  value: number | string;
}

export interface PeractChipProps {
  children?: ReactNode;
  actionFilter: (value: string | number) => void;
  data: PeractChipData;
}