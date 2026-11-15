import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { BodySplashModalFormValues, ModalProps } from "../models/body-splash.models";
import { useRef, useState } from "react";
import { BODY_SPLASH_ALREADY_LINKED, validateBodySplash } from "../services/body-splash.service";
export function useBodySplashModalForm({
  onClose,
  onSave,
  edit
}: ModalProps) {
  const form = useForm<BodySplashModalFormValues>({
    defaultValues: {
      produtoId: String(edit?.produtoId ?? ""),
      precos: {
        preco10ml: String(edit?.preco10ml ?? ""),
        preco15ml: String(edit?.preco15ml ?? ""),
        preco20ml: String(edit?.preco20ml ?? ""),
        preco25ml: String(edit?.preco25ml ?? ""),
        preco30ml: String(edit?.preco30ml ?? "")
      }
    }
  });
  const {
    produtoId,
    precos
  } = form.watch();
  const setProdutoId = (value: SetStateAction<BodySplashModalFormValues["produtoId"]>) => {
    if (edit) return;
    form.setValue("produtoId", typeof value === "function" ? value(form.getValues("produtoId")) : value, {
      shouldDirty: true
    });
  };
  const setPrecos = (value: SetStateAction<BodySplashModalFormValues["precos"]>) => form.setValue("precos", typeof value === "function" ? value(form.getValues("precos")) : value, {
    shouldDirty: true
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const handleSave = async () => {
    if (submitting.current) return;
    const validationError = validateBodySplash(form.getValues());
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    submitting.current = true;
    setSaving(true);
    try {
      await onSave({ produtoId, precos });
      setSuccess(true);
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message === BODY_SPLASH_ALREADY_LINKED
        ? BODY_SPLASH_ALREADY_LINKED : "Não foi possível salvar o Body Splash.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return {
    produtoId,
    precos,
    setProdutoId,
    setPrecos,
    error,
    success,
    saving,
    handleSave
  };
}
