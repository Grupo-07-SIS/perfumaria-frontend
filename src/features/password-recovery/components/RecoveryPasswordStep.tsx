import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { PeractSecretInput } from "../../../shared/components/peract-secret-input";
import { PeractButton } from "../../../shared/components/peract-button";
import { passwordValidation } from "../../../core/security/security.validation";
import type { PasswordResetValues } from "../models/password-recovery.models";

export function RecoveryPasswordStep({ loading, onSubmit }: { loading: boolean; onSubmit: (values: PasswordResetValues) => Promise<void> }) {
  const { control, handleSubmit, formState: { errors }, getValues, setFocus } = useForm<PasswordResetValues>({ defaultValues: { novaSenha: "", confirmacao: "" } });
  useEffect(() => { setFocus("novaSenha"); }, [setFocus]);
  return <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={loading}>
    <p className="text-sm peract-font-color-muted">Use de 8 a 72 bytes UTF-8. A confirmação precisa ser exatamente igual; espaços e acentos fazem parte da senha.</p>
    <Controller control={control} name="novaSenha" rules={{ validate: passwordValidation }} render={({ field }) => <PeractSecretInput label="Nova senha" required autoComplete="new-password" ref={field.ref} onBlur={field.onBlur} name={field.name} value={field.value} onValueChange={field.onChange} disabled={loading} errorText={errors.novaSenha?.message} aria-invalid={!!errors.novaSenha} validation={errors.novaSenha ? "invalid" : "non-validation"} />} />
    <Controller control={control} name="confirmacao" rules={{ validate: value => value === getValues("novaSenha") || "As senhas não coincidem." }} render={({ field }) => <PeractSecretInput label="Confirmar nova senha" required autoComplete="new-password" ref={field.ref} onBlur={field.onBlur} name={field.name} value={field.value} onValueChange={field.onChange} disabled={loading} errorText={errors.confirmacao?.message} aria-invalid={!!errors.confirmacao} validation={errors.confirmacao ? "invalid" : "non-validation"} />} />
    <PeractButton theme="primary" type="submit" disabled={loading}>{loading ? "Redefinindo…" : "Redefinir senha"}</PeractButton>
  </form>;
}