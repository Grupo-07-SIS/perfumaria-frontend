import type { AuthLoginPayload, AuthSession, AuthenticatedUser } from "../auth/auth.types";
import { sessionService } from "../auth/session.service";

interface AuthUserRecord extends AuthenticatedUser {
  senha?: string;
}

interface LoginOptions {
  credentials: AuthLoginPayload;
  users: AuthUserRecord[];
}

function createMockToken(user: AuthenticatedUser) {
  return `peract-token-${user.id}-${Date.now()}`;
}

function sanitizeUser(user: AuthUserRecord): AuthenticatedUser {
  return {
    cargo: user.cargo,
    email: user.email,
    id: user.id,
    nome: user.nome,
  };
}

export const authService = {
  login({ credentials, users }: LoginOptions): AuthSession | null {
    const matchedUser = users.find(
      (user) => user.email === credentials.email && user.senha === credentials.password,
    );

    if (!matchedUser) return null;

    return sessionService.save({
      accessToken: createMockToken(matchedUser),
      user: sanitizeUser(matchedUser),
    });
  },
  logout() {
    sessionService.clear();
  },
  restoreSession() {
    return sessionService.restore();
  },
};