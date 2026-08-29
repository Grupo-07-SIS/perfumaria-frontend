import { cn } from "../ui/utils";
import type { PeractTagProps } from "./PeractTag.types";

const tagClassNames = {
  default: "bg-stone-100 text-stone-600",
  alert: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  accent: "bg-[color:color-mix(in_srgb,var(--brand-accent)_14%,white)] text-[color:var(--brand-accent)]",
} as const;

export function PeractTag({ children, className, icon, label, type = "default", ...props }: PeractTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tagClassNames[type],
        className,
      )}
      {...props}
    >
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      {children ?? label}
    </span>
  );
}