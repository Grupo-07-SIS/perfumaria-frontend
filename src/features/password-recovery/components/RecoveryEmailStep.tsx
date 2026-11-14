import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractButton } from "../../../shared/components/peract-button";

export function RecoveryEmailStep({ loading, onSubmit }: { loading: boolean; onSubmit: (email: string) => Promise<void> }) {
  const { control, handleSubmit, formState: { errors }, setFocus } = useForm<{ email: string }>({ defaultValues: { email: "" } });
  useEffect(() => { setFocus("email"); }, [setFocus]);
  return <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(values => onSubmit(values.email))} aria-busy={loading}>
    <Controller control={control} name="email" rules={{ required: "Informe o e-mail da conta.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Informe um e-mail válido." } }} render={({ field }) => <PeractInput label="E-mail da conta" type="email" required autoComplete="email" ref={field.ref} onBlur={field.onBlur} name={field.name} value={field.value} onValueChange={field.onChange} disabled={loading} errorText={errors.email?.message} aria-invalid={!!errors.email} validation={errors.email ? "invalid" : "non-validation"} />} />
    <PeractButton theme="primary" type="submit" disabled={loading}>{loading ? "Buscando perguntas…" : "Continuar"}</PeractButton>
  </form>;
}