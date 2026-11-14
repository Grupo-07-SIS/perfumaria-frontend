import { securityRequest } from "../../../core/services/security-http";
import type { RecoveryChallengeDTO, ResetAuthorizationDTO, ResetPasswordDTO, StartRecoveryDTO, VerifyRecoveryDTO } from "./dto/password-recovery.dto";

const path = "/auth/recuperacao-senha";
/** Public capabilities are intentionally separate from normal authentication. */
const post = <T>(operation: string, dto: unknown, token?: string) => securityRequest<T>(`${path}/${operation}`, {
  method: "POST", credentials: "omit", headers: { "Content-Type": "application/json", ...(token ? { "X-Recuperacao-Token": token } : {}) }, body: JSON.stringify(dto),
});
export const passwordRecoveryRepository = {
  start: (dto: StartRecoveryDTO) => post<RecoveryChallengeDTO>("iniciar", dto),
  verify: (token: string, dto: VerifyRecoveryDTO) => post<ResetAuthorizationDTO>("verificar", dto, token),
  reset: (token: string, dto: ResetPasswordDTO) => post<void>("redefinir", dto, token),
};