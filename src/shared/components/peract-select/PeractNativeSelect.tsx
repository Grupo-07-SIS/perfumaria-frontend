import { forwardRef } from "react";
import { cn } from "../ui/utils";
import type { PeractNativeSelectProps } from "./PeractNativeSelect.types";

export const PeractNativeSelect = forwardRef<HTMLSelectElement, PeractNativeSelectProps>(
  function PeractNativeSelect({ children, className, ...props }, ref) {
    return <select ref={ref} className={cn("peract-field-control", className)} {...props}>{children}</select>;
  },
);