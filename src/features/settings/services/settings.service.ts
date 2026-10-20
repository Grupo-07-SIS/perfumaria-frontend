import type { SettingsFormValues } from "../models/settings.models";
import axios from "axios";
import type { AuthSession, AuthenticatedUser } from "../../../core/auth/auth.types";
import { authService } from "../../../core/services/auth.service";
import { settingsRepository } from "../repository/settings.repository";
import type { AccountSessionResponseDto } from "../repository/dto/account-settings.dto";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "../../../shared/utils/password";

function mapAccountSession(response: AccountSessionResponseDto): AuthSession {
  const role = response.usuario.tipoUsuario.trim().toUpperCase();
  const user: AuthenticatedUser = {
    id: response.usuario.id,
    nome: response.usuario.nome,
    email: response.usuario.email,
    cargo: role === "ADMIN" || role === "ADMINISTRADOR" ? "Administrador" : "Funcionário",
    idOrganizacao: response.usuario.idOrganizacao,
  };
  return authService.saveSession({
    accessToken: response.accessToken,
    expiresIn: response.expiresIn,
    user,
  });
}

export async function changeAccountPassword(senhaAtual: string, novaSenha: string) {
  return mapAccountSession(await settingsRepository.changePassword({ senhaAtual, novaSenha }));
}

export async function changeAccountEmail(senhaAtual: string, novoEmail: string) {
  return mapAccountSession(await settingsRepository.changeEmail({ senhaAtual, novoEmail }));
}

export function accountSettingsError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  const status = error.response?.status;
  if (status === 400) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    return typeof message === "string" ? message : "Confira os dados informados e tente novamente.";
  }
  if (status === 401) return "A senha atual está incorreta. Confira e tente novamente.";
  if (status === 403) return "Você não tem permissão para alterar esta conta.";
  if (status === 409) return "Este e-mail já está cadastrado. Informe outro e-mail.";
  if (status !== undefined && status >= 500) return "O servidor está temporariamente indisponível. Tente novamente em instantes.";
  if (!error.response) return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  return fallback;
}

export function validatePasswordChange({
  senhaAtual,
  novaSenha,
  confirmSenha
}: Pick<SettingsFormValues, "senhaAtual" | "novaSenha" | "confirmSenha">) {
  const errors: Record<string, string> = {};
  if (!senhaAtual) errors.senhaAtual = "Informe a senha atual.";
  if (!novaSenha) errors.novaSenha = "Informe a nova senha.";else if (!isStrongPassword(novaSenha)) errors.novaSenha = STRONG_PASSWORD_MESSAGE;
  if (novaSenha !== confirmSenha) errors.confirmSenha = "As senhas não coincidem.";
  return errors;
}
export function validateEmailChange({
  novoEmail,
  confirmEmail,
  senhaConfEmail
}: Pick<SettingsFormValues, "novoEmail" | "confirmEmail" | "senhaConfEmail">) {
  const errors: Record<string, string> = {};
  const normalizedEmail = novoEmail.trim().toLowerCase();
  if (!normalizedEmail) errors.novoEmail = "Informe o novo e-mail.";else if (normalizedEmail.length > 45) errors.novoEmail = "O e-mail deve ter no máximo 45 caracteres.";else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) errors.novoEmail = "E-mail inválido.";
  if (normalizedEmail !== confirmEmail.trim().toLowerCase()) errors.confirmEmail = "Os e-mails não coincidem.";
  if (!senhaConfEmail) errors.senhaConfEmail = "Confirme com sua senha atual.";
  return errors;
}
