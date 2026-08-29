import { forwardRef } from "react";
import { cn } from "../ui/utils";
import { formatPeractInputValue, getNativeInputType } from "./inputFormatters";
import type { PeractInputProps } from "./PeractInput.types";

const themeClassNames = {
  primary: "bg-[color:var(--input-background)]",
  secondary: "bg-white",
} as const;

const validationClassNames = {
  "non-validation": "",
  invalid: "peract-validation-invalid",
  valid: "peract-validation-valid",
} as const;

export const PeractInput = forwardRef<HTMLInputElement, PeractInputProps>(function PeractInput(
  {
    className,
    disabled,
    errorText,
    icon,
    iconClassName,
    label,
    onValueChange,
    placeholder,
    required,
    rightAdornment,
    theme = "primary",
    type = "text",
    validation = "non-validation",
    value,
    ...props
  },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="peract-font-weight-medium peract-font-color-muted text-xs tracking-[0.06em]">
          {label}
          {required ? " *" : ""}
        </span>
      ) : null}
      <span
        className={cn(
          "peract-input-shell flex items-center gap-3 px-3 py-2.5",
          themeClassNames[theme],
          validationClassNames[validation],
          disabled && "opacity-60",
          className,
        )}
      >
        {icon ? <span className={cn("peract-font-color-accent flex shrink-0 items-center", iconClassName)}>{icon}</span> : null}
        <input
          {...props}
          className="peract-sans-font w-full bg-transparent text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)]"
          disabled={disabled}
          placeholder={placeholder}
          ref={ref}
          required={required}
          type={getNativeInputType(type)}
          value={value}
          onChange={(event) => {
            onValueChange?.(formatPeractInputValue(type, event.target.value));
          }}
        />
        {rightAdornment ? <span className="flex shrink-0 items-center">{rightAdornment}</span> : null}
      </span>
      {errorText ? <span className="text-xs text-red-600">{errorText}</span> : null}
    </label>
  );
});