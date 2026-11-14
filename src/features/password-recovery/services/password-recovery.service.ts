import { answerValidation, assertThreeOrders, passwordValidation } from "../../../core/security/security.validation";
import { passwordRecoveryRepository } from "../repository/password-recovery.repository";
import { fromChallengeDTO, fromResetAuthorizationDTO } from "../repository/mapper/password-recovery.mapper";
import type { PasswordResetValues, RecoveryAnswer, RecoveryChallenge, ResetAuthorization } from "../models/password-recovery.models";

export function assertNotExpired(authorization: ResetAuthorization | RecoveryChallenge) {
  const expiresAt = Date.parse(authorization.expiresAt);
  if (!authorization.token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) throw new Error("O prazo expirou. Reinicie a recuperação.");
}
export const passwordRecoveryService = {
  async start(email: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
    return fromChallengeDTO(await passwordRecoveryRepository.start({ email }));
  },
  async verify(challenge: RecoveryChallenge, respostas: RecoveryAnswer[]) {
    assertNotExpired(challenge);
    assertThreeOrders(respostas);
    for (const answer of respostas) {
      const validation = answerValidation(answer.resposta);
      if (validation !== true) throw new Error(validation);
    }
    return fromResetAuthorizationDTO(await passwordRecoveryRepository.verify(challenge.token, { respostas: respostas.map(({ ordem, resposta }) => ({ ordem, resposta })) }));
  },
  async reset(authorization: ResetAuthorization, values: PasswordResetValues) {
    assertNotExpired(authorization);
    const validation = passwordValidation(values.novaSenha);
    if (validation !== true) throw new Error(validation);
    if (values.novaSenha !== values.confirmacao) throw new Error("As senhas não coincidem.");
    await passwordRecoveryRepository.reset(authorization.token, { novaSenha: values.novaSenha, confirmacao: values.confirmacao });
  },
};