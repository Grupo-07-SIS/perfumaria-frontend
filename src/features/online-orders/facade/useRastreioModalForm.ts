import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { RastreioModalFormValues } from "../models/online-orders.models";
import type { Venda } from "../../../core/store/AppContext";

export function useRastreioModalForm({
  venda,
  onClose,
  onConfirm
}: {
  venda: Venda;
  onClose: () => void;
  onConfirm: (codigo: string) => void;
}) {


const form = useForm<RastreioModalFormValues>({ defaultValues: {
codigo: "",
} });
const { codigo } = form.watch();
const setCodigo = (value: SetStateAction<RastreioModalFormValues["codigo"]>) => form.setValue("codigo", typeof value === "function" ? value(form.getValues("codigo")) : value, { shouldDirty: true });

  
return { codigo, setCodigo };
}
