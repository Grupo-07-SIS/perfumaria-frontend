import * as Dialog from "@radix-ui/react-dialog";
import { useRef } from "react";
import { cn } from "../../utils/cn";
import type { PeractModalProps } from "./PeractModal.types";
export function PeractModal({
  children,
  className,
  open = true,
  onClose,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: PeractModalProps) {
  const openingElement = useRef<HTMLElement | null>(
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  return <Dialog.Root open={open} onOpenChange={nextOpen => {
    if (!nextOpen) onClose();
  }}>
      <Dialog.Portal>
        <Dialog.Overlay data-slot="dialog-overlay" className="peract-modal-overlay" />
        <Dialog.Content
          data-slot="dialog-content"
          aria-describedby={undefined}
          className={cn("peract-modal-surface peract-bg-card peract-border-default", className)}
          onOpenAutoFocus={event => {
            if (document.activeElement instanceof HTMLElement && !document.activeElement.closest('[role="dialog"]')) {
              openingElement.current = document.activeElement;
            }
            onOpenAutoFocus?.(event);
          }}
          onCloseAutoFocus={event => {
            onCloseAutoFocus?.(event);
            if (!event.defaultPrevented && openingElement.current?.isConnected) {
              event.preventDefault();
              openingElement.current.focus();
            }
          }}
          {...props}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>;
}
