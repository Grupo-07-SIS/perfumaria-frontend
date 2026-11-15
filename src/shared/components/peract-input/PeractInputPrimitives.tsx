import * as React from "react";
import { cn } from "../../utils/cn";
import { usePeractFieldId } from "../peract-field";
const PeractInputControl = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(function PeractInputControl({
  className,
  type,
  ...props
}, ref) {
  const fieldId = usePeractFieldId();
  return <input id={fieldId} ref={ref} type={type} data-slot="input" className={cn(type === "checkbox" || type === "radio" ? "peract-checkbox peract-focus-ring" : "peract-field-control", className)} {...props} />;
});
export { PeractInputControl };
