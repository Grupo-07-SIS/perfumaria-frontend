import { cn } from "../ui/utils";
import type { PeractCardProps } from "./PeractCard.types";

export function PeractCard({
  children,
  className,
  content,
  horizontalWidth,
  style,
  title,
  verticalWidth,
  ...props
}: PeractCardProps) {
  return (
    <div
      className={cn("peract-bg-card peract-border-default peract-radius-xl", className)}
      style={{
        width: horizontalWidth,
        minHeight: verticalWidth,
        ...style,
      }}
      {...props}
    >
      {title ? <h3 className="peract-serif-font peract-font-color-primary mb-2 text-lg font-normal tracking-[0.02em]">{title}</h3> : null}
      {children ?? (content ? <p className="peract-font-color-muted text-sm">{content}</p> : null)}
    </div>
  );
}