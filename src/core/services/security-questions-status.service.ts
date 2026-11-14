import { securityRequest } from "./security-http";
export interface SecurityQuestionsStatus { quantidade: number; completo: boolean }
export async function getSecurityQuestionsStatus(): Promise<SecurityQuestionsStatus> {
  const dto = await securityRequest<SecurityQuestionsStatus>("/usuarios/me/perguntas-seguranca/status", { credentials: "include" });
  if (!Number.isInteger(dto.quantidade) || dto.quantidade < 0 || typeof dto.completo !== "boolean" || (dto.completo && dto.quantidade !== 3)) {
    throw new Error("Status de segurança inválido.");
  }
  return { quantidade: dto.quantidade, completo: dto.completo };
}