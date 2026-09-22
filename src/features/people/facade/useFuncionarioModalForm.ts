import { validateFuncionario } from "../services/people.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { FuncionarioModalFormValues } from "../models/people.models";
import type { FuncionarioModalProps } from "../models/people.models";
import { useState } from "react";

export function useFuncionarioModalForm({
  data,
  onClose,
  onSave
}: FuncionarioModalProps) {


const form = useForm<FuncionarioModalFormValues>({ defaultValues: {
nome: data?.nome ?? "",
cargo: data?.cargo ?? "Funcionário",
email: data?.email ?? "",
senha: data?.senha ?? "",
confirmSenha: data?.senha ?? "",
} });
const { nome, cargo, email, senha, confirmSenha } = form.watch();
const setNome = (value: SetStateAction<FuncionarioModalFormValues["nome"]>) => form.setValue("nome", typeof value === "function" ? value(form.getValues("nome")) : value, { shouldDirty: true });
const setCargo = (value: SetStateAction<FuncionarioModalFormValues["cargo"]>) => form.setValue("cargo", typeof value === "function" ? value(form.getValues("cargo")) : value, { shouldDirty: true });
const setEmail = (value: SetStateAction<FuncionarioModalFormValues["email"]>) => form.setValue("email", typeof value === "function" ? value(form.getValues("email")) : value, { shouldDirty: true });
const setSenha = (value: SetStateAction<FuncionarioModalFormValues["senha"]>) => form.setValue("senha", typeof value === "function" ? value(form.getValues("senha")) : value, { shouldDirty: true });
const setConfirmSenha = (value: SetStateAction<FuncionarioModalFormValues["confirmSenha"]>) => form.setValue("confirmSenha", typeof value === "function" ? value(form.getValues("confirmSenha")) : value, { shouldDirty: true });

  const [showSenha, setShowSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const isNew = !data;
  const handleSave = () => {
    const e = validateFuncionario({ nome, email, senha, confirmSenha, isNew });
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSuccess(true);
    onSave({
      nome: nome.trim(),
      cargo,
      email: email.trim(),
      senha: senha || data?.senha
    });
    setTimeout(onClose, 1200);
  };
  
return { nome, cargo, email, senha, confirmSenha, setNome, setCargo, setEmail, setSenha, setConfirmSenha, showSenha, setShowSenha, errors, setErrors, success, isNew, handleSave };
}
