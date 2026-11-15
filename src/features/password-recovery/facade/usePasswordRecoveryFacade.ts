import { useCallback, useEffect, useRef, useState } from "react";
import { actionToast } from "../../../shared/services/action-toast";
import { securityErrorMessage, SecurityHttpError } from "../../../core/services/security-http";
import { passwordRecoveryService } from "../services/password-recovery.service";
import { RECOVERY_INVALID_ANSWERS } from "../config/password-recovery.config";
import type { PasswordResetValues, RecoveryAnswer, RecoveryState } from "../models/password-recovery.models";

export function usePasswordRecoveryFacade() {
  const [state, setState] = useState<RecoveryState>({ step: "email" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formVersion, setFormVersion] = useState(0);
  const stateRef = useRef<RecoveryState>(state);
  const generation = useRef(0);
  const busy = useRef(false);
  const commit = useCallback((next: RecoveryState) => { stateRef.current = next; setState(next); }, []);
  const restart = useCallback(() => {
    generation.current++; busy.current = false;
    commit({ step: "email" }); setLoading(false); setError(""); setFormVersion(value => value + 1);
  }, [commit]);
  useEffect(() => () => { generation.current++; stateRef.current = { step: "email" }; busy.current = false; }, []);

  const expiresAt = state.step === "answers" ? state.challenge.expiresAt : state.step === "password" ? state.authorization.expiresAt : null;
  useEffect(() => {
    if (!expiresAt) return;
    const expire = () => { restart(); setError("O prazo expirou. Informe seu e-mail para reiniciar a recuperação."); };
    const remaining = Date.parse(expiresAt) - Date.now();
    if (remaining <= 0) { expire(); return; }
    const timer = setTimeout(expire, remaining);
    return () => clearTimeout(timer);
  }, [expiresAt, restart]);

  const execute = useCallback(async (expected: RecoveryState["step"], operation: () => Promise<RecoveryState>) => {
    if (busy.current || stateRef.current.step !== expected) return;
    busy.current = true; setLoading(true); setError("");
    const request = generation.current;
    try {
      const next = await operation();
      if (request !== generation.current) return;
      commit(next); setFormVersion(value => value + 1);
      if (next.step === "success") actionToast.success("Senha redefinida com sucesso!", "Entre com sua nova senha para acessar o sistema.");
    } catch (cause) {
      if (request !== generation.current) return;
      // Never identify which of the three answers failed.
      setError(expected === "answers" && cause instanceof SecurityHttpError && cause.status === 401 ? RECOVERY_INVALID_ANSWERS : securityErrorMessage(cause));
      actionToast.error(expected === "password" ? "Não foi possível redefinir a senha." : "Não foi possível continuar a recuperação.");
    } finally {
      if (request === generation.current) { busy.current = false; setLoading(false); }
    }
  }, [commit]);
  const start = (email: string) => execute("email", async () => ({ step: "answers", challenge: await passwordRecoveryService.start(email) }));
  const verify = (answers: RecoveryAnswer[]) => execute("answers", async () => {
    const current = stateRef.current;
    if (current.step !== "answers") throw new Error("Reinicie a recuperação.");
    return { step: "password", authorization: await passwordRecoveryService.verify(current.challenge, answers) };
  });
  const reset = (values: PasswordResetValues) => execute("password", async () => {
    const current = stateRef.current;
    if (current.step !== "password") throw new Error("Reinicie a recuperação.");
    await passwordRecoveryService.reset(current.authorization, values);
    return { step: "success" }; // No applyAuthSession, cookie, redirect timer or automatic login.
  });
  return { state, loading, error, expiresAt, formVersion, start, verify, reset, restart };
}