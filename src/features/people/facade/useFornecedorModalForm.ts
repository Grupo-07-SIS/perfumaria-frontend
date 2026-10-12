import { peopleErrorMessage, validateFornecedor } from "../services/people.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { FornecedorModalFormValues, FornecedorModalProps } from "../models/people.models";
import { useState } from "react";
import { EMPTY_ENDERECO } from "../config/people.config";
import { formatCnpj, formatTelefone } from "../../../shared/utils/masks";
import { useCepAutofill } from "./useCepAutofill";
export function useFornecedorModalForm({
  data,
  onSave
}: FornecedorModalProps) {
  const form = useForm<FornecedorModalFormValues>({
    defaultValues: {
      razaoSocial: data?.razaoSocial ?? "",
      cnpj: formatCnpj(data?.cnpj ?? ""),
      email: data?.email ?? "",
      telefone: formatTelefone(data?.telefone ?? ""),
      endereco: data?.endereco ?? {
        ...EMPTY_ENDERECO
      }
    }
  });
  const {
    razaoSocial,
    cnpj,
    email,
    telefone,
    endereco
  } = form.watch();
  const setRazaoSocial = (value: SetStateAction<FornecedorModalFormValues["razaoSocial"]>) => form.setValue("razaoSocial", typeof value === "function" ? value(form.getValues("razaoSocial")) : value, {
    shouldDirty: true
  });
  const setCnpj = (value: SetStateAction<FornecedorModalFormValues["cnpj"]>) => form.setValue("cnpj", formatCnpj(typeof value === "function" ? value(form.getValues("cnpj")) : value), {
    shouldDirty: true
  });
  const setEmail = (value: SetStateAction<FornecedorModalFormValues["email"]>) => form.setValue("email", typeof value === "function" ? value(form.getValues("email")) : value, {
    shouldDirty: true
  });
  const setTelefone = (value: SetStateAction<FornecedorModalFormValues["telefone"]>) => form.setValue("telefone", formatTelefone(typeof value === "function" ? value(form.getValues("telefone")) : value), {
    shouldDirty: true
  });
  const setEndereco = (value: SetStateAction<FornecedorModalFormValues["endereco"]>) => form.setValue("endereco", typeof value === "function" ? value(form.getValues("endereco")) : value, {
    shouldDirty: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const clearError = (key: string) => setErrors(p => ({
    ...p,
    [key]: ""
  }));
  const cepLookup = useCepAutofill(endereco, setEndereco, clearError);
  const handleSave = async () => {
    const e = validateFornecedor({
      razaoSocial,
      cnpj,
      email,
      telefone,
      endereco
    });
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    try {
      await onSave({
        razaoSocial: razaoSocial.trim(),
        cnpj: cnpj.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        endereco
      });
      setSuccess(true);
    } catch (error) {
      setErrors({ form: peopleErrorMessage(error, "Não foi possível salvar o fornecedor. Tente novamente.") });
    }
  };
  return {
    razaoSocial,
    cnpj,
    email,
    telefone,
    endereco,
    setRazaoSocial,
    setCnpj,
    setEmail,
    setTelefone,
    setEndereco,
    errors,
    success,
    clearError,
    cepLookup,
    handleSave
  };
}
