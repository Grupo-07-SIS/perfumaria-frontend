import { PeractButton } from "../peract-button";
import type { PeractChipProps } from "./PeractChip.types";

export function PeractChip({ actionFilter, children, data }: PeractChipProps) {
  return (
    <PeractButton
      aria-pressed={data.selected}
      action={() => actionFilter(data.value)}
      className={data.selected ? "border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] text-white" : "text-gray-600"}
      size="sm"
      theme={data.selected ? "primary" : "secondary"}
    >
      {children ?? data.label}
    </PeractButton>
  );
}