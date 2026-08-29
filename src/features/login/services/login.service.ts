import type { AuthSession } from "../../../core/auth/auth.types";
import type { Funcionario } from "../../../app/context/AppContext";
import { loginRepository } from "../repository/login.repository";
import type { LoginFormData } from "../models/login.models";

interface ExecuteLoginParams {
  credentials: LoginFormData;
  delayMs?: number;
  users: Funcionario[];
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, delayMs);
  });
}

export async function executeLogin({
  credentials,
  delayMs = 700,
  users,
}: ExecuteLoginParams) {
  await wait(delayMs);

  return loginRepository.authenticate({
    credentials: {
      email: credentials.email.trim(),
      password: credentials.password,
    },
    users,
  });
}

export function hasAuthenticatedSession(session: AuthSession | null) {
  return Boolean(session);
}