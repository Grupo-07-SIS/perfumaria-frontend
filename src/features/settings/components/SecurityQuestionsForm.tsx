import { Controller } from "react-hook-form";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractSecretInput } from "../../../shared/components/peract-secret-input";
import { EXACT_ANSWER_NOTICE, answerValidation, currentPasswordValidation, questionValidation } from "../../../core/security/security.validation";
import { useSecurityQuestionsFacade } from "../facade/useSecurityQuestionsFacade";

export function SecurityQuestionsForm() {
  const facade = useSecurityQuestionsFacade();
  const { control, formState: { errors }, getValues } = facade.form;
  const disabled = facade.loading || facade.saving || facade.loadFailed;
  return (
    <PeractCard className="p-4 lg:p-6">
      <h2 data-tour="tour-settings-questions" className="peract-serif-font mb-2">Perguntas de segurança</h2>
      <p className="mb-3 text-sm peract-font-color-muted">Cadastre exatamente três perguntas pessoais e diferentes. A senha atual é exigida tanto no primeiro cadastro quanto na substituição. Não use informações públicas ou fáceis de adivinhar.</p>
      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{EXACT_ANSWER_NOTICE}</p>
      {facade.error && <p role="alert" className="mb-4 text-sm text-red-700">{facade.error}</p>}
      {facade.success && <p role="status" className="mb-4 text-sm text-green-700">{facade.success}</p>}
      {facade.loading && <p role="status">Carregando perguntas…</p>}
      {facade.loadFailed && <PeractButton theme="secondary" action={() => void facade.load()}>Tentar carregar novamente</PeractButton>}
      <form onSubmit={facade.onSubmit} noValidate className="flex max-w-2xl flex-col gap-5" aria-busy={facade.saving || facade.loading}>
        {[0, 1, 2].map(index => (
          <fieldset key={index} disabled={disabled} className="flex flex-col gap-3 peract-border-default peract-radius-xl p-4">
            <legend className="px-1 text-sm font-medium">Pergunta e resposta {index + 1}</legend>
            <Controller control={control} name={`perguntas.${index}.pergunta`} rules={{ validate: value => {
              const validation = questionValidation(value);
              if (validation !== true) return validation;
              return !getValues("perguntas").some((other, otherIndex) => otherIndex !== index && other.pergunta.trim() === value.trim()) || "As três perguntas devem ser diferentes.";
            } }} render={({ field }) => <PeractInput label={`Pergunta ${index + 1}`} required ref={field.ref} name={field.name} onBlur={field.onBlur} value={field.value} onValueChange={field.onChange} disabled={disabled} errorText={errors.perguntas?.[index]?.pergunta?.message} aria-invalid={!!errors.perguntas?.[index]?.pergunta} validation={errors.perguntas?.[index]?.pergunta ? "invalid" : "non-validation"} autoComplete="off" />} />
            <Controller control={control} name={`perguntas.${index}.resposta`} rules={{ validate: answerValidation }} render={({ field }) => <PeractSecretInput label={`Resposta ${index + 1}`} required ref={field.ref} name={field.name} onBlur={field.onBlur} value={field.value} onValueChange={field.onChange} disabled={disabled} autoComplete="off" errorText={errors.perguntas?.[index]?.resposta?.message} aria-invalid={!!errors.perguntas?.[index]?.resposta} validation={errors.perguntas?.[index]?.resposta ? "invalid" : "non-validation"} />} />
          </fieldset>
        ))}
        <Controller control={control} name="senhaAtual" rules={{ validate: currentPasswordValidation }} render={({ field }) => <PeractSecretInput label="Senha atual para confirmar o cadastro" required ref={field.ref} name={field.name} onBlur={field.onBlur} value={field.value} onValueChange={field.onChange} disabled={disabled} autoComplete="current-password" errorText={errors.senhaAtual?.message} aria-invalid={!!errors.senhaAtual} validation={errors.senhaAtual ? "invalid" : "non-validation"} />} />
        <PeractButton type="submit" theme="primary" disabled={disabled}>{facade.saving ? "Salvando…" : "Salvar perguntas de segurança"}</PeractButton>
      </form>
    </PeractCard>
  );
}