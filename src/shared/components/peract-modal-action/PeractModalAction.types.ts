import { type MouseEventHandler, type ReactNode } from "react";

export interface PeractModalActionProps {
  btnPrimaryAction: MouseEventHandler<HTMLButtonElement>;
  buttonSecondaryAction: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  content?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  title: string;
}