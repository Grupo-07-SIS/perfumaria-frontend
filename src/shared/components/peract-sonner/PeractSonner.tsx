"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { Toaster as Sonner, ToasterProps } from "sonner";
const PeractToaster = ({
  ...props
}: ToasterProps) => {
  return <Sonner theme="light" richColors closeButton position="top-right" duration={5000}
    containerAriaLabel="Notificações de ações"
    toastOptions={{ className: "peract-toast", closeButtonAriaLabel: "Fechar notificação" }}
    icons={{ success: <CircleCheck size={22} aria-hidden="true" data-toast-icon="success" />, error: <CircleX size={22} aria-hidden="true" data-toast-icon="error" /> }}
    className="peract-sans-font toaster group" style={{
    "--normal-bg": "var(--popover)",
    "--normal-text": "var(--popover-foreground)",
    "--normal-border": "var(--border)",
    "--success-bg": "#ecfdf5",
    "--success-text": "#065f46",
    "--success-border": "#6ee7b7",
    "--error-bg": "#fef2f2",
    "--error-text": "#991b1b",
    "--error-border": "#fca5a5"
  } as React.CSSProperties} {...props} />;
};
export { PeractToaster };
