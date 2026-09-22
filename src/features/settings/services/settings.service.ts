import type { SettingsFormValues } from "../models/settings.models";

export function validatePasswordChange({ senhaAtual, novaSenha, confirmSenha }: Pick<SettingsFormValues, "senhaAtual" | "novaSenha" | "confirmSenha">) {
const errors: Record<string, string> = {};
    if (!senhaAtual) errors.senhaAtual = "Informe a senha atual.";
    if (!novaSenha) errors.novaSenha = "Informe a nova senha.";else if (novaSenha.length < 6) errors.novaSenha = "Mínimo de 6 caracteres.";
    if (novaSenha !== confirmSenha) errors.confirmSenha = "As senhas não coincidem.";
return errors;
}

export function validateEmailChange({ novoEmail, confirmEmail, senhaConfEmail }: Pick<SettingsFormValues, "novoEmail" | "confirmEmail" | "senhaConfEmail">) {
const errors: Record<string, string> = {};
    if (!novoEmail.trim()) errors.novoEmail = "Informe o novo e-mail.";else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) errors.novoEmail = "E-mail inválido.";
    if (novoEmail !== confirmEmail) errors.confirmEmail = "Os e-mails não coincidem.";
    if (!senhaConfEmail) errors.senhaConfEmail = "Confirme com sua senha atual.";
return errors;
}
