import { PeractButton } from "../peract-button";
import type { PeractChipProps } from "./PeractChip.types";

export function PeractChip({ actionFilter, data }: PeractChipProps) {
  return (
    <PeractButton
      action={() => actionFilter(data.value)}
      className={data.selected ? "border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] text-white" : "text-gray-600"}
      size="sm"
      theme={data.selected ? "primary" : "secondary"}
    >
      {data.label}
    </PeractButton>
  );
}