export type AuthUserRole = "Administrador" | "Funcionário";

export interface AuthenticatedUser {
  cargo: AuthUserRole;
  email: string;
  id: number;
  nome: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
  user: AuthenticatedUser;
}