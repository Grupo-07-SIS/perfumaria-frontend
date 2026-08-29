import { type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode } from "react";

export type PeractButtonTheme = "primary" | "secondary";
export type PeractButtonSize = "default" | "sm" | "icon";

export interface PeractButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  action?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  label?: string;
  icon?: ReactNode;
  iconClassName?: string;
  theme?: PeractButtonTheme;
  size?: PeractButtonSize;
}