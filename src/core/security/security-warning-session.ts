const key = "peract.security-warning-session";
export interface WarningSession { userId: string; sessionId: string; dismissed: boolean; shown: boolean }
/** Stores only a UI preference and a random, non-authenticating session identifier. */
export const securityWarningSession = {
  begin(userId: string, restore = false): WarningSession {
    if (restore) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(key) || "null");
        if (saved?.userId === userId && typeof saved.sessionId === "string" && typeof saved.dismissed === "boolean") return { userId, sessionId: saved.sessionId, dismissed: saved.dismissed, shown: saved.shown === true };
      } catch { /* Storage unavailable: preference stays in memory. */ }
    }
    // This identifier is a UI preference key, never an authentication credential.
    const sessionId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const session = { userId, sessionId, dismissed: false, shown: false };
    this.save(session);
    return session;
  },
  save(session: WarningSession) {
    try { sessionStorage.setItem(key, JSON.stringify(session)); } catch { /* In-memory fallback. */ }
  },
  clear() {
    try { sessionStorage.removeItem(key); } catch { /* In-memory fallback. */ }
  },
};