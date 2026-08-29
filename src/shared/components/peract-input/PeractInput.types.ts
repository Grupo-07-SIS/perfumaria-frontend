import { type InputHTMLAttributes, type ReactNode } from "react";

export type PeractInputType =
  | "email"
  | "password"
  | "text"
  | "telephone"
  | "cnpj"
  | "currency"
  | "percent"
  | "cep"
  | "number";

export type PeractFieldTheme = "primary" | "secondary";
export type PeractValidationState = "non-validation" | "invalid" | "valid";

export interface PeractInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "onChange" | "type"> {
  errorText?: string;
  icon?: ReactNode;
  iconClassName?: string;
  label?: string;
  onValueChange?: (value: string) => void;
  rightAdornment?: ReactNode;
  theme?: PeractFieldTheme;
  type?: PeractInputType;
  validation?: PeractValidationState;
}