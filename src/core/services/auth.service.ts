import { sessionService } from "../auth/session.service";
import type { AuthenticatedUser } from "../auth/auth.types";
import { environment } from "../../environment";

export const authService = {
  restoreSession() {
    return sessionService.restore();
  },
  saveSession(session: { accessToken: string; expiresIn?: number; user: AuthenticatedUser }) {
    return sessionService.save(
      {
        accessToken: session.accessToken,
        user: session.user,
      },
      session.expiresIn,
    );
  },
  clearSession() {
    sessionService.clear();
  },
  async logout() {
    try {
      await fetch(`${environment.backendUrl}/auth/logout`, {
        credentials: "include",
        method: "POST",
      });
    } finally {
      sessionService.clear();
    }
  },
};