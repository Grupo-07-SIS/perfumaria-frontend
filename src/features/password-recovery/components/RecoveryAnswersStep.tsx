import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractSecretInput } from "../../../shared/components/peract-secret-input";
import { PeractButton } from "../../../shared/components/peract-button";
import { EXACT_ANSWER_NOTICE, answerValidation } from "../../../core/security/security.validation";
import type { RecoveryAnswer, RecoveryQuestion } from "../models/password-recovery.models";

export function RecoveryAnswersStep({ questions, loading, onSubmit }: { questions: RecoveryQuestion[]; loading: boolean; onSubmit: (answers: RecoveryAnswer[]) => Promise<void> }) {
  const { control, handleSubmit, formState: { errors }, setFocus } = useForm<{ respostas: RecoveryAnswer[] }>({ defaultValues: { respostas: questions.map(({ ordem }) => ({ ordem, resposta: "" })) } });
  useEffect(() => { setFocus("respostas.0.resposta"); }, [setFocus]);
  return <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(values => onSubmit(values.respostas))} aria-busy={loading}>
    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{EXACT_ANSWER_NOTICE}</p>
    {questions.map((question, index) => <fieldset disabled={loading} key={question.ordem} className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium">Pergunta {question.ordem}</legend>
      <PeractInput label={`Texto da pergunta ${question.ordem}`} readOnly value={question.pergunta} aria-readonly="true" />
      <Controller control={control} name={`respostas.${index}.resposta`} rules={{ validate: answerValidation }} render={({ field }) => <PeractSecretInput label={`Resposta ${question.ordem}`} required autoComplete="off" ref={field.ref} onBlur={field.onBlur} name={field.name} value={field.value} onValueChange={field.onChange} disabled={loading} errorText={errors.respostas?.[index]?.resposta?.message} aria-invalid={!!errors.respostas?.[index]?.resposta} validation={errors.respostas?.[index]?.resposta ? "invalid" : "non-validation"} />} />
    </fieldset>)}
    <PeractButton theme="primary" type="submit" disabled={loading}>{loading ? "Verificando…" : "Verificar respostas"}</PeractButton>
  </form>;
}