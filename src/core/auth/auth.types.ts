export type AuthUserRole = "Administrador" | "Funcionário";

export interface AuthenticatedUser {
  cargo: AuthUserRole;
  donoOrganizacao?: boolean;
  email: string;
  id: string;
  idOrganizacao?: number | null;
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