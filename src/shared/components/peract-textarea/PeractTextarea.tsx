import * as React from "react";
import { cn } from "../../utils/cn";
import { usePeractFieldId } from "../peract-field";
const PeractTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<"textarea">>(function PeractTextarea({
  className,
  ...props
}, ref) {
  const fieldId = usePeractFieldId();
  return <textarea id={fieldId} ref={ref} data-slot="textarea" className={cn("peract-field-control min-h-16 resize-y", className)} {...props} />;
});
export { PeractTextarea };
