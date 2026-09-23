import { validateCliente } from "../services/people.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { ClienteModalFormValues, ClienteModalProps } from "../models/people.models";
import { useState } from "react";
import { EMPTY_ENDERECO } from "../config/people.config";
export function useClienteModalForm({
  data,
  onClose,
  onSave
}: ClienteModalProps) {
  const form = useForm<ClienteModalFormValues>({
    defaultValues: {
      nome: data?.nome ?? "",
      telefone: data?.telefone ?? "",
      email: data?.email ?? "",
      endereco: data?.endereco ?? {
        ...EMPTY_ENDERECO
      }
    }
  });
  const {
    nome,
    telefone,
    email,
    endereco
  } = form.watch();
  const setNome = (value: SetStateAction<ClienteModalFormValues["nome"]>) => form.setValue("nome", typeof value === "function" ? value(form.getValues("nome")) : value, {
    shouldDirty: true
  });
  const setTelefone = (value: SetStateAction<ClienteModalFormValues["telefone"]>) => form.setValue("telefone", typeof value === "function" ? value(form.getValues("telefone")) : value, {
    shouldDirty: true
  });
  const setEmail = (value: SetStateAction<ClienteModalFormValues["email"]>) => form.setValue("email", typeof value === "function" ? value(form.getValues("email")) : value, {
    shouldDirty: true
  });
  const setEndereco = (value: SetStateAction<ClienteModalFormValues["endereco"]>) => form.setValue("endereco", typeof value === "function" ? value(form.getValues("endereco")) : value, {
    shouldDirty: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const clearError = (key: string) => setErrors(p => ({
    ...p,
    [key]: ""
  }));
  const handleSave = async () => {
    const e = validateCliente({
      nome,
      telefone
    });
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    try {
      await onSave({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        endereco
      });
      setSuccess(true);
    } catch {
      setErrors({ form: "Não foi possível salvar o cliente." });
    }
  };
  return {
    nome,
    telefone,
    email,
    endereco,
    setNome,
    setTelefone,
    setEmail,
    setEndereco,
    errors,
    success,
    clearError,
    handleSave
  };
}
