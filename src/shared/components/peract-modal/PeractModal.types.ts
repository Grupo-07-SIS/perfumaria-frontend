import type { ComponentPropsWithoutRef } from "react";
import type * as Dialog from "@radix-ui/react-dialog";

export interface PeractModalProps extends ComponentPropsWithoutRef<typeof Dialog.Content> {
  open?: boolean;
  onClose: () => void;
}