import { validateNovoCliente } from "../services/sales.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { NovoClienteModalFormValues } from "../models/sales.models";
import { useState } from "react";

export function useNovoClienteModalForm({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (nome: string, telefone: string) => void;
}) {


const form = useForm<NovoClienteModalFormValues>({ defaultValues: {
nome: "",
telefone: "",
} });
const { nome, telefone } = form.watch();
const setNome = (value: SetStateAction<NovoClienteModalFormValues["nome"]>) => form.setValue("nome", typeof value === "function" ? value(form.getValues("nome")) : value, { shouldDirty: true });
const setTelefone = (value: SetStateAction<NovoClienteModalFormValues["telefone"]>) => form.setValue("telefone", typeof value === "function" ? value(form.getValues("telefone")) : value, { shouldDirty: true });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const ACC = "#c29958";
  const DARK = "#050300";
  const handleSave = () => {
    const e = validateNovoCliente({ nome, telefone });
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      onSave(nome.trim(), telefone.trim());
      onClose();
    }, 900);
  };
  
return { nome, telefone, setNome, setTelefone, errors, setErrors, success, ACC, handleSave };
}
