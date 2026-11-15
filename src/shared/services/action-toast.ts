import { toast } from "sonner";

/** Feedback de ações explícitas; não deve ser usado em carregamentos automáticos. */
export const actionToast = {
  success(title: string, description?: string): void {
    toast.success(title, { description });
  },
  error(title: string, description = "Tente novamente mais tarde"): void {
    toast.error(title, { description });
  },
};