export interface PeractChipData {
  label: string;
  selected: boolean;
  value: number | string;
}

export interface PeractChipProps {
  actionFilter: (value: string | number) => void;
  data: PeractChipData;
}