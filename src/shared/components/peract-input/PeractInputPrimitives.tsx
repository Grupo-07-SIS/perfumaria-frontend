import * as React from "react";
import { cn } from "../ui/utils";
const PeractInputControl = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(function PeractInputControl({
  className,
  type,
  ...props
}, ref) {
  return <input ref={ref} type={type} data-slot="input" className={cn(
    type === "checkbox" || type === "radio" ? "peract-checkbox peract-focus-ring" : "peract-field-control",
    className,
  )} {...props} />;
});
export { PeractInputControl };
