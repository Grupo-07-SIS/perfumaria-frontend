import { useForm } from "react-hook-form";
import { validateDecant } from "../services/decants.service";
import type { SetStateAction } from "react";
import type { DecantModalFormValues } from "../models/decants.models";
import type { DecantModalProps } from "../models/decants.models";
import { useState } from "react";

export function useDecantModalForm({
  onClose,
  onSave,
  edit
}: DecantModalProps) {


const form = useForm<DecantModalFormValues>({ defaultValues: {
perfume: edit?.perfume ?? "",
preco2ml: String(edit?.preco2ml ?? ""),
preco3ml: String(edit?.preco3ml ?? ""),
preco5ml: String(edit?.preco5ml ?? ""),
preco10ml: String(edit?.preco10ml ?? ""),
} });
const { perfume, preco2ml, preco3ml, preco5ml, preco10ml } = form.watch();
const setPerfume = (value: SetStateAction<DecantModalFormValues["perfume"]>) => form.setValue("perfume", typeof value === "function" ? value(form.getValues("perfume")) : value, { shouldDirty: true });
const setPreco2ml = (value: SetStateAction<DecantModalFormValues["preco2ml"]>) => form.setValue("preco2ml", typeof value === "function" ? value(form.getValues("preco2ml")) : value, { shouldDirty: true });
const setPreco3ml = (value: SetStateAction<DecantModalFormValues["preco3ml"]>) => form.setValue("preco3ml", typeof value === "function" ? value(form.getValues("preco3ml")) : value, { shouldDirty: true });
const setPreco5ml = (value: SetStateAction<DecantModalFormValues["preco5ml"]>) => form.setValue("preco5ml", typeof value === "function" ? value(form.getValues("preco5ml")) : value, { shouldDirty: true });
const setPreco10ml = (value: SetStateAction<DecantModalFormValues["preco10ml"]>) => form.setValue("preco10ml", typeof value === "function" ? value(form.getValues("preco10ml")) : value, { shouldDirty: true });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const handleSave = () => {
    const validationError = validateDecant(form.getValues());
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSuccess(true);
    onSave({
      perfume,
      preco2ml: parseFloat(preco2ml),
      preco3ml: parseFloat(preco3ml),
      preco5ml: parseFloat(preco5ml),
      preco10ml: parseFloat(preco10ml)
    });
    setTimeout(onClose, 1200);
  };
  
return { perfume, preco2ml, preco3ml, preco5ml, preco10ml, setPerfume, setPreco2ml, setPreco3ml, setPreco5ml, setPreco10ml, error, success, handleSave };
}
