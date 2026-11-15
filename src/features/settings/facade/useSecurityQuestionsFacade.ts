import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useApp } from "../../../core/store/AppContext";
import { securityErrorMessage, SecurityHttpError } from "../../../core/services/security-http";
import { securityQuestionsService } from "../services/security-questions.service";
import { emptySecurityQuestions } from "../config/security-questions.config";
import type { SecurityQuestionsFormValues } from "../models/security-questions.models";

export function useSecurityQuestionsFacade() {
  const { currentUser, refreshSecurityQuestionsStatus, invalidateAuthSession, markSecurityQuestionsComplete } = useApp();
  const form = useForm<SecurityQuestionsFormValues>({ defaultValues: emptySecurityQuestions() });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const generation = useRef(0);
  const busy = useRef(false);
  const dependencies = useRef({ refreshSecurityQuestionsStatus, invalidateAuthSession, markSecurityQuestionsComplete });
  dependencies.current = { refreshSecurityQuestionsStatus, invalidateAuthSession, markSecurityQuestionsComplete };
  const { reset, handleSubmit } = form;

  const handleError = useCallback((cause: unknown) => {
    setError(securityErrorMessage(cause));
    if (cause instanceof SecurityHttpError && cause.status === 401) dependencies.current.invalidateAuthSession();
  }, []);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true); setError(""); setLoadFailed(false); setSuccess("");
    reset(emptySecurityQuestions());
    try {
      const questions = await securityQuestionsService.load();
      if (request !== generation.current) return;
      const values = emptySecurityQuestions();
      values.perguntas = values.perguntas.map(pair => ({ ...pair, pergunta: questions.find(question => question.ordem === pair.ordem)?.pergunta || "" }));
      reset(values); // Answers and password are always empty, even on edit.
    } catch (cause) {
      if (request !== generation.current) return;
      setLoadFailed(true); handleError(cause);
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [reset, handleError]);
  useEffect(() => {
    void load();
    return () => { generation.current++; busy.current = false; };
  }, [currentUser?.id, load]);

  const onSubmit = handleSubmit(async values => {
    if (busy.current || loading || loadFailed) return;
    busy.current = true; setSaving(true); setError(""); setSuccess("");
    const request = generation.current;
    try {
      await securityQuestionsService.save(values);
      if (request !== generation.current) return;
      reset({ senhaAtual: "", perguntas: values.perguntas.map(({ ordem, pergunta }) => ({ ordem, pergunta: pergunta.trim(), resposta: "" })) });
      setSuccess("Perguntas de segurança cadastradas. As respostas não são exibidas; para substituir, redigite as três.");
      dependencies.current.markSecurityQuestionsComplete();
      await dependencies.current.refreshSecurityQuestionsStatus();
    } catch (cause) {
      if (request === generation.current) handleError(cause);
    } finally {
      if (request === generation.current) { busy.current = false; setSaving(false); }
    }
  });
  return { form, loading, saving, loadFailed, error, success, load, onSubmit };
}