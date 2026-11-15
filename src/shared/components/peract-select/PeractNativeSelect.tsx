import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { usePeractFieldId } from "../peract-field";
import type { PeractNativeSelectProps } from "./PeractNativeSelect.types";
export const PeractNativeSelect = forwardRef<HTMLSelectElement, PeractNativeSelectProps>(function PeractNativeSelect({
  children,
  className,
  ...props
}, ref) {
  const fieldId = usePeractFieldId();
  return <select id={fieldId} ref={ref} className={cn("peract-field-control", className)} {...props}>{children}</select>;
});
