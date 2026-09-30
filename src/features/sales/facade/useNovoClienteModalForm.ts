import { salesErrorMessage, validateNovoCliente } from "../services/sales.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { NovoClienteModalFormValues } from "../models/sales.models";
import { useRef, useState } from "react";
export function useNovoClienteModalForm({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (values: NovoClienteModalFormValues) => Promise<void>;
}) {
  const form = useForm<NovoClienteModalFormValues>({
    defaultValues: {
      nome: "",
      telefone: "",
      email: ""
    }
  });
  const {
    nome,
    telefone,
    email
  } = form.watch();
  const setNome = (value: SetStateAction<NovoClienteModalFormValues["nome"]>) => form.setValue("nome", typeof value === "function" ? value(form.getValues("nome")) : value, {
    shouldDirty: true
  });
  const setTelefone = (value: SetStateAction<NovoClienteModalFormValues["telefone"]>) => form.setValue("telefone", typeof value === "function" ? value(form.getValues("telefone")) : value, {
    shouldDirty: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setEmail = (value: string) => form.setValue("email", value, { shouldDirty: true });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitting = useRef(false);
  const ACC = "#c29958";
  const handleSave = async () => {
    if (submitting.current) return;
    const values = form.getValues();
    const validationErrors = validateNovoCliente(values);
    setErrors(validationErrors);
    setSubmitError("");
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      await onSave(values);
      onClose();
    } catch (error) {
      setSubmitError(salesErrorMessage(error, "Não foi possível cadastrar o cliente."));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return {
    nome,
    telefone,
    setNome,
    setTelefone,
    errors,
    setErrors,
    email,
    setEmail,
    saving,
    submitError,
    ACC,
    handleSave
  };
}
