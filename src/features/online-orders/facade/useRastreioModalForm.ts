import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { RastreioModalFormValues } from "../models/online-orders.models";
export function useRastreioModalForm() {
  const form = useForm<RastreioModalFormValues>({
    defaultValues: {
      codigo: ""
    }
  });
  const {
    codigo
  } = form.watch();
  const error = form.formState.errors.codigo?.message;
  const setCodigo = (value: SetStateAction<RastreioModalFormValues["codigo"]>) => {
    form.setValue("codigo", typeof value === "function" ? value(form.getValues("codigo")) : value, {
      shouldDirty: true
    });
    form.clearErrors("codigo");
  };
  const confirmar = (onConfirm: (codigo: string) => void) => {
    const normalizedCode = form.getValues("codigo").trim();
    if (normalizedCode.length > 100) {
      form.setError("codigo", { type: "maxLength", message: "Máximo de 100 caracteres." });
      return;
    }
    onConfirm(normalizedCode);
  };
  return {
    codigo,
    setCodigo,
    error,
    confirmar
  };
}
