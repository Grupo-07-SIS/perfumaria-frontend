import type { ReactNode } from "react";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface DemoAccount {
  color: string;
  email: string;
  icon: ReactNode;
  label: string;
  senha: string;
}

export interface LoginFormFacade {
  authError: string;
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  handleSelectAccount: (account: DemoAccount) => void;
  loading: boolean;
  onSubmit: () => void;
  setValue: UseFormSetValue<LoginFormData>;
  showPass: boolean;
  togglePasswordVisibility: () => void;
}