export const STRONG_PASSWORD_MESSAGE = "Use no mínimo 6 caracteres).";

export function isStrongPassword(password: string): boolean {
  return password.length >= 6 && new TextEncoder().encode(password).length <= 72;
}