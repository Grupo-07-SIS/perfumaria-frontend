import { cn } from "../ui/utils";
function PeractSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("peract-sans-font bg-accent animate-pulse peract-radius-md", className)} {...props} />;
}
export { PeractSkeleton };
