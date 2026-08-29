import type { Control, FieldErrors } from "react-hook-form";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormFacade {
  authError: string;
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  loading: boolean;
  onSubmit: () => void;
  showPass: boolean;
  togglePasswordVisibility: () => void;
}