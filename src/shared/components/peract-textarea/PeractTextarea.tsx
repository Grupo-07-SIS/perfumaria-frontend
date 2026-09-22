import * as React from "react";
import { cn } from "../ui/utils";
const PeractTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<"textarea">>(function PeractTextarea({
  className,
  ...props
}, ref) {
  return <textarea ref={ref} data-slot="textarea" className={cn("peract-field-control min-h-16 resize-y", className)} {...props} />;
});
export { PeractTextarea };
