import { forwardRef, type ComponentRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cn } from "../ui/utils";
import type { PeractCheckboxProps } from "./PeractCheckbox.types";

export const PeractCheckbox = forwardRef<ComponentRef<typeof CheckboxPrimitive.Root>, PeractCheckboxProps>(
  function PeractCheckbox({ className, checked, ...props }, ref) {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="checkbox"
        checked={checked}
        className={cn("peract-checkbox peract-focus-ring", className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {checked === "indeterminate" ? <MinusIcon className="size-3.5" /> : <CheckIcon className="size-3.5" />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);