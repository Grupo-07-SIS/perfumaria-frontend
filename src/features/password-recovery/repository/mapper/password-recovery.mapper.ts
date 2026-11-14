import { assertThreeOrders } from "../../../../core/security/security.validation";
import type { RecoveryChallenge, ResetAuthorization } from "../../models/password-recovery.models";
import type { RecoveryChallengeDTO, ResetAuthorizationDTO } from "../dto/password-recovery.dto";

function assertAuthorization(token: string, expiresAt: string) {
  if (typeof token !== "string" || !token || typeof expiresAt !== "string" || !/Z$/.test(expiresAt) || !Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) {
    throw new Error("Autorização inválida ou expirada. Reinicie a recuperação.");
  }
}
export function fromChallengeDTO(dto: RecoveryChallengeDTO): RecoveryChallenge {
  assertAuthorization(dto.tokenDesafio, dto.expiraEm);
  if (!Array.isArray(dto.perguntas) || dto.perguntas.some(question => typeof question.pergunta !== "string")) throw new Error("Perguntas de recuperação inválidas.");
  assertThreeOrders(dto.perguntas);
  return { token: dto.tokenDesafio, expiresAt: dto.expiraEm, questions: dto.perguntas.map(({ ordem, pergunta }) => ({ ordem, pergunta })).sort((a, b) => a.ordem - b.ordem) };
}
export function fromResetAuthorizationDTO(dto: ResetAuthorizationDTO): ResetAuthorization {
  assertAuthorization(dto.tokenRedefinicao, dto.expiraEm);
  return { token: dto.tokenRedefinicao, expiresAt: dto.expiraEm };
}