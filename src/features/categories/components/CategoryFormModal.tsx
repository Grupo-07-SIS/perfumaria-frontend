import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { Controller, useForm } from "react-hook-form";
import { CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractAlert } from "../../../shared/components/peract-alert";
import type { CategoryFormData } from "../models/categories.models";
interface CategoryFormModalProps {
  defaultValues?: CategoryFormData;
  onClose: () => void;
  onSave: (formData: CategoryFormData) => Promise<void>;
  submitting: boolean;
  title: string;
}
export function CategoryFormModal({
  defaultValues,
  onClose,
  onSave,
  submitting,
  title
}: CategoryFormModalProps) {
  const [success, setSuccess] = useState(false);
  const {
    control,
    formState: {
      errors
    },
    handleSubmit,
    reset,
    setError,
    clearErrors
  } = useForm<CategoryFormData>({
    defaultValues: defaultValues ?? {
      nome: ""
    }
  });
  useEffect(() => {
    reset(defaultValues ?? {
      nome: ""
    });
    setSuccess(false);
  }, [defaultValues, reset]);
  const submitForm = handleSubmit(async formData => {
    clearErrors("root");
    try {
      await onSave({ nome: formData.nome.trim() });
      setSuccess(true);
      window.setTimeout(onClose, 1200);
    } catch {
      setError("root", { message: "Não foi possível salvar a categoria." });
    }
  });
  return <PeractModal className="max-w-sm peract-radius-lg peract-bg-card shadow-2xl" onClose={onClose}>
        <div className="flex items-center justify-between border-b peract-border-color p-4">
          <PeractModalTitle className="peract-font-color-default">{title}</PeractModalTitle>
          <PeractButton aria-label="Fechar" action={onClose} className="h-8 w-8 rounded-lg peract-font-color-muted hover:bg-gray-100" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>
        <form className="flex flex-col gap-3 p-4" onSubmit={submitForm}>
          {errors.root?.message ? <PeractAlert variant="destructive">{errors.root.message}</PeractAlert> : null}
          {success ? <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
              <CheckCircle size={16} /> Categoria salva com sucesso!
            </div> : null}

          <Controller control={control} name="nome" rules={{
        required: "O nome da categoria é obrigatório."
      }} render={({
        field
      }) => <PeractInput autoFocus errorText={errors.nome?.message} onValueChange={field.onChange} placeholder="Ex: Perfumes, Body Splash, Kits..." required type="text" validation={errors.nome ? "invalid" : "non-validation"} value={field.value}>Nome da categoria</PeractInput>} />

          <div className="flex gap-2 border-t peract-border-color pt-4">
            <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary" type="button">Cancelar</PeractButton>
            <PeractButton className="flex-1" disabled={submitting} type="submit">
              {submitting ? "Salvando..." : "Salvar"}
            </PeractButton>
          </div>
        </form>
      </PeractModal>;
}
