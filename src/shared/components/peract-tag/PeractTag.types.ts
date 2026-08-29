import { type HTMLAttributes, type ReactNode } from "react";

export type PeractTagType = "default" | "alert" | "success" | "warning" | "accent";

export interface PeractTagProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  icon?: ReactNode;
  label?: string;
  type?: PeractTagType;
}