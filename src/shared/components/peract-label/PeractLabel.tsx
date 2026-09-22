"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../utils/cn";
import { usePeractFieldId } from "../peract-field";
function PeractLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const fieldId = usePeractFieldId();
  return <LabelPrimitive.Root htmlFor={fieldId} data-slot="label" className={cn("peract-sans-font flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)} {...props} />;
}
export { PeractLabel };
