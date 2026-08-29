import { type HTMLAttributes, type ReactNode } from "react";

export interface PeractCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  content?: string;
  horizontalWidth?: number | string;
  title?: string;
  verticalWidth?: number | string;
}