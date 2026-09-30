import axios from "axios";
import { settingsRepository } from "../repository/settings.repository";

export function isValidStockLimit(limit: number): boolean {
  return Number.isInteger(limit) && limit >= 1 && limit <= 2147483647;
}

export function hasOrganization(id: number | null | undefined): id is number {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

export async function fetchStockLimit(id: number): Promise<number | null> {
  const organization = await settingsRepository.getOrganization(id);
  if (organization.idOrganizacao !== id || (organization.limite !== null && !isValidStockLimit(organization.limite))) {
    throw new Error("INVALID_ORGANIZATION_RESPONSE");
  }
  return organization.limite;
}

export async function saveStockLimit(id: number, value: string): Promise<number> {
  const limite = Number(value);
  if (!hasOrganization(id) || !isValidStockLimit(limite)) throw new Error("INVALID_STOCK_SETTINGS");
  const organization = await settingsRepository.updateLimit(id, { limite });
  if (organization.idOrganizacao !== id || organization.limite === null || !isValidStockLimit(organization.limite)) {
    throw new Error("INVALID_ORGANIZATION_RESPONSE");
  }
  return organization.limite;
}

export function stockSettingsError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  const messages: Record<number, string> = {
    400: "Limite inválido. Verifique o valor informado.",
    401: "Sessão expirada. Entre novamente.",
    403: "Você não tem permissão para alterar esta organização.",
    404: "Organização não encontrada.",
  };
  return messages[error.response?.status ?? 0] ?? fallback;
}