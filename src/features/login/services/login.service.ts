import type { AuthSession } from "../../../core/auth/auth.types";
import { authService } from "../../../core/services/auth.service";
import { loginRepository } from "../repository/login.repository";
import { toAuthenticatedUser } from "../repository/mapper/login-session.mapper";
import type { LoginFormData } from "../models/login.models";

interface ExecuteLoginParams {
  credentials: LoginFormData;
  delayMs?: number;
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, delayMs);
  });
}

export async function executeLogin({
  credentials,
  delayMs = 700,
}: ExecuteLoginParams) {
  await wait(delayMs);

  const loginResponse = await loginRepository.authenticate({
    credentials: {
      email: credentials.email.trim(),
      senha: credentials.password,
    },
  });

  return authService.saveSession({
    accessToken: loginResponse.accessToken,
    expiresIn: loginResponse.expiresIn,
    user: toAuthenticatedUser(loginResponse),
  });
}

export function hasAuthenticatedSession(session: AuthSession | null) {
  return Boolean(session);
}