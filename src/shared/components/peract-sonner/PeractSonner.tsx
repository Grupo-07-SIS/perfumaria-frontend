"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
const PeractToaster = ({
  ...props
}: ToasterProps) => {
  const {
    theme = "system"
  } = useTheme();
  return <Sonner theme={theme as ToasterProps["theme"]} className="peract-sans-font toaster group" style={{
    "--normal-bg": "var(--popover)",
    "--normal-text": "var(--popover-foreground)",
    "--normal-border": "var(--border)"
  } as React.CSSProperties} {...props} />;
};
export { PeractToaster };
