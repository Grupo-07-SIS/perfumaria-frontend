import { sessionService } from "../auth/session.service";
import type { AuthenticatedUser } from "../auth/auth.types";
import { apiClient } from "./http-client";

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
      await apiClient.post("/auth/logout");
    } finally {
      sessionService.clear();
    }
  },
};