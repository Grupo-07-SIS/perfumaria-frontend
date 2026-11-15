import type { AuthSession, AuthenticatedUser } from "./auth.types";
import { getCookie, removeCookie, setCookie } from "./cookieStorage";
import { tokenService } from "./token.service";

const AUTH_USER_COOKIE = "authUser";
const DEFAULT_SESSION_DURATION_SECONDS = 60 * 60 * 8;
const clearListeners = new Set<() => void>();

function serializeUser(user: AuthenticatedUser) {
  return JSON.stringify(user);
}

function deserializeUser(serializedUser: string | null) {
  if (!serializedUser) return null;

  try {
    return JSON.parse(serializedUser) as AuthenticatedUser;
  } catch {
    return null;
  }
}

function getExpiryDate(expiresInSeconds: number) {
  return new Date(Date.now() + expiresInSeconds * 1000).toISOString();
}

export const sessionService = {
  subscribeToClear(listener: () => void) {
    clearListeners.add(listener);
    return () => { clearListeners.delete(listener); };
  },
  clear() {
    tokenService.clear();
    removeCookie(AUTH_USER_COOKIE);
    clearListeners.forEach(listener => listener());
  },
  restore(): AuthSession | null {
    const accessToken = tokenService.get();
    const user = deserializeUser(getCookie(AUTH_USER_COOKIE));

    if (!accessToken || !user) {
      this.clear();
      return null;
    }

    return {
      accessToken,
      expiresAt: getExpiryDate(DEFAULT_SESSION_DURATION_SECONDS),
      user,
    };
  },
  save(session: Pick<AuthSession, "accessToken" | "user">, expiresInSeconds = DEFAULT_SESSION_DURATION_SECONDS) {
    tokenService.set(session.accessToken, expiresInSeconds);
    setCookie(AUTH_USER_COOKIE, serializeUser(session.user), { maxAge: expiresInSeconds });

    return {
      ...session,
      expiresAt: getExpiryDate(expiresInSeconds),
    } satisfies AuthSession;
  },
};