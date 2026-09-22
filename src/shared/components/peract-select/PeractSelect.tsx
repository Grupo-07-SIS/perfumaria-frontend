import {
  PeractSelectRoot as Select,
  PeractSelectContent as SelectContent,
  PeractSelectItem as SelectItem,
  PeractSelectTrigger as SelectTrigger,
  PeractSelectValue as SelectValue,
} from "./PeractSelectPrimitives";
import { cn } from "../ui/utils";
import type { PeractSelectProps } from "./PeractSelect.types";

const themeClassNames = {
  primary: "bg-[color:var(--input-background)]",
  secondary: "bg-white",
} as const;

const validationClassNames = {
  "non-validation": "",
  invalid: "peract-validation-invalid",
  valid: "peract-validation-valid",
} as const;

export function PeractSelect<TValue extends string = string>({
  data,
  errorText,
  icon,
  iconClassName,
  label,
  onValueChange,
  placeholder,
  required,
  theme = "primary",
  validation = "non-validation",
  value,
}: PeractSelectProps<TValue>) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="peract-font-weight-medium peract-font-color-muted text-xs tracking-[0.06em]">
          {label}
          {required ? " *" : ""}
        </span>
      ) : null}
      <div
        className={cn(
          "peract-input-shell flex items-center gap-3 rounded-[calc(var(--radius)+2px)] px-3 py-0.5",
          themeClassNames[theme],
          validationClassNames[validation],
        )}
      >
        {icon ? <span className={cn("peract-font-color-accent flex shrink-0 items-center", iconClassName)}>{icon}</span> : null}
        <Select value={value} onValueChange={(nextValue) => onValueChange?.(nextValue as TValue)}>
          <SelectTrigger className="w-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {data.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {errorText ? <span className="text-xs text-red-600">{errorText}</span> : null}
    </label>
  );
}