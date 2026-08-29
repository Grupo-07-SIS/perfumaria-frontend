import { type ReactNode } from "react";
import type { PeractFieldTheme, PeractValidationState } from "../peract-input";

export interface PeractSelectOption<TValue extends string = string> {
  name: string;
  value: TValue;
}

export interface PeractSelectProps<TValue extends string = string> {
  data: Array<PeractSelectOption<TValue>>;
  errorText?: string;
  icon?: ReactNode;
  iconClassName?: string;
  label?: string;
  onValueChange?: (value: TValue) => void;
  placeholder?: string;
  required?: boolean;
  theme?: PeractFieldTheme;
  validation?: PeractValidationState;
  value?: TValue;
}