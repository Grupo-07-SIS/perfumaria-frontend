import { useCallback, useEffect, useRef, useState } from "react";
import { environment } from "../../environment";
import { getSecurityQuestionsStatus } from "../services/security-questions-status.service";
import { SecurityHttpError } from "../services/security-http";
import { securityWarningSession, type WarningSession } from "./security-warning-session";

export interface SecurityWarningState {
  phase: "idle" | "loading" | "ready" | "unavailable";
  complete: boolean | null;
  warningVisible: boolean;
}
const initial = (): SecurityWarningState => ({ phase: "idle", complete: null, warningVisible: false });

export function useSecurityQuestionsStatus(userId: string | undefined, onUnauthorized: () => void) {
  const [state, setState] = useState<SecurityWarningState>(initial);
  const [sessionVersion, setSessionVersion] = useState(0);
  const session = useRef<WarningSession | null>(null);
  const generation = useRef(0);
  const alive = useRef(true);
  const unauthorized = useRef(onUnauthorized);
  unauthorized.current = onUnauthorized;

  const endSession = useCallback(() => {
    generation.current++;
    session.current = null;
    securityWarningSession.clear();
    setState(initial());
  }, []);
  const beginSession = useCallback((id: string) => {
    generation.current++;
    session.current = securityWarningSession.begin(id);
    setState(initial());
    setSessionVersion(value => value + 1);
  }, []);
  const refresh = useCallback(async () => {
    if (!environment.features.securityQuestionsEnabled || !session.current) return;
    const id = session.current.sessionId;
    const requestGeneration = ++generation.current;
    setState(previous => ({ ...previous, phase: "loading" }));
    const isCurrent = () => alive.current && requestGeneration === generation.current && id === session.current?.sessionId;
    try {
      const status = await getSecurityQuestionsStatus();
      if (!isCurrent()) return;
      if (!status.completo && session.current) {
        session.current = { ...session.current, shown: true };
        securityWarningSession.save(session.current);
      }
      setState({ phase: "ready", complete: status.completo, warningVisible: !!session.current?.shown && !session.current.dismissed });
    } catch (error) {
      if (!isCurrent()) return;
      setState(previous => ({ ...previous, phase: "unavailable" }));
      if (error instanceof SecurityHttpError && error.status === 401) {
        endSession();
        unauthorized.current();
      }
    }
  }, [endSession]);
  const dismiss = useCallback(() => {
    if (session.current) {
      session.current = { ...session.current, dismissed: true };
      securityWarningSession.save(session.current);
    }
    setState(previous => ({ ...previous, warningVisible: false }));
  }, []);
  const markComplete = useCallback(() => {
    if (!session.current) return;
    generation.current++; // Ignore a pre-save status request that could report the old state.
    setState(previous => ({ ...previous, phase: "ready", complete: true }));
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; generation.current++; };
  }, []);
  useEffect(() => {
    if (!userId || !environment.features.securityQuestionsEnabled) {
      endSession();
      return;
    }
    if (session.current?.userId !== userId) {
      generation.current++;
      session.current = securityWarningSession.begin(userId, true);
      setState({ ...initial(), warningVisible: session.current.shown && !session.current.dismissed });
    }
    void refresh();
    return () => { generation.current++; };
  }, [userId, sessionVersion, refresh, endSession]);

  return { state, refresh, dismiss, markComplete, beginSession, endSession };
}