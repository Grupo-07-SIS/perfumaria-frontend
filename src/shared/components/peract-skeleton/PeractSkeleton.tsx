import { cn } from "../../utils/cn";
function PeractSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("peract-sans-font bg-accent animate-pulse peract-radius-md", className)} {...props} />;
}
export { PeractSkeleton };
