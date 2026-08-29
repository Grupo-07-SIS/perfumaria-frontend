import { cn } from "../ui/utils";
import type { PeractButtonProps } from "./PeractButton.types";

const themeClassNames = {
  primary: "peract-bg-primary border border-[color:var(--primary)]",
  secondary: "peract-bg-secondary peract-border-default",
} as const;

const sizeClassNames = {
  default: "px-4 py-3 text-sm",
  sm: "px-3 py-2 text-xs",
  icon: "h-10 w-10 px-0 py-0",
} as const;

export function PeractButton({
  action,
  children,
  className,
  disabled,
  icon,
  iconClassName,
  label,
  size = "default",
  theme = "primary",
  type = "button",
  ...props
}: PeractButtonProps) {
  return (
    <button
      className={cn(
        "peract-button-base peract-font-weight-medium peract-sans-font",
        themeClassNames[theme],
        sizeClassNames[size],
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      disabled={disabled}
      onClick={action}
      type={type}
      {...props}
    >
      {icon ? <span className={cn("flex shrink-0 items-center justify-center", iconClassName)}>{icon}</span> : null}
      {children ?? label}
    </button>
  );
}