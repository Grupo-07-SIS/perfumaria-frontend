import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { BodySplashModalFormValues } from "../models/body-splash.models";
import type { ModalProps } from "../models/body-splash.models";
import { useState } from "react";
import { validateBodySplash } from "../services/body-splash.service";

export function useBodySplashModalForm({
  onClose,
  onSave,
  edit
}: ModalProps) {


const form = useForm<BodySplashModalFormValues>({ defaultValues: {
produto: edit?.produto ?? "",
precos: {
    preco10ml: String(edit?.preco10ml ?? ""),
    preco15ml: String(edit?.preco15ml ?? ""),
    preco20ml: String(edit?.preco20ml ?? ""),
    preco25ml: String(edit?.preco25ml ?? ""),
    preco30ml: String(edit?.preco30ml ?? "")
  },
} });
const { produto, precos } = form.watch();
const setProduto = (value: SetStateAction<BodySplashModalFormValues["produto"]>) => form.setValue("produto", typeof value === "function" ? value(form.getValues("produto")) : value, { shouldDirty: true });
const setPrecos = (value: SetStateAction<BodySplashModalFormValues["precos"]>) => form.setValue("precos", typeof value === "function" ? value(form.getValues("precos")) : value, { shouldDirty: true });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const handleSave = () => {
    const validationError = validateBodySplash(form.getValues());
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSuccess(true);
    onSave({
      produto,
      preco10ml: parseFloat(precos.preco10ml),
      preco15ml: parseFloat(precos.preco15ml),
      preco20ml: parseFloat(precos.preco20ml),
      preco25ml: parseFloat(precos.preco25ml),
      preco30ml: parseFloat(precos.preco30ml)
    });
    setTimeout(onClose, 1200);
  };
  
return { produto, precos, setProduto, setPrecos, error, success, handleSave };
}
