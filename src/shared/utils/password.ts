export const STRONG_PASSWORD_MESSAGE = "Use no mínimo 6 caracteres (máximo de 72 bytes).";

export function isStrongPassword(password: string): boolean {
  return password.length >= 6 && new TextEncoder().encode(password).length <= 72;
}