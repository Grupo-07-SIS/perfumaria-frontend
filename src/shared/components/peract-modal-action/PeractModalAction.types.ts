import { type MouseEventHandler, type ReactNode } from "react";

export interface PeractModalActionProps {
  btnPrimaryAction: MouseEventHandler<HTMLButtonElement>;
  buttonSecondaryAction: () => void;
  children?: ReactNode;
  content?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  title?: string;
  heading?: ReactNode;
  actions?: ReactNode;
  submitting?: boolean;
}