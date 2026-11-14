import { securityRequest } from "../../../core/services/security-http";
import type { CsrfDTO, SecurityQuestionDTO, UpdateSecurityQuestionsDTO } from "./dto/security-questions.dto";

const path = "/usuarios/me/perguntas-seguranca";
export const securityQuestionsRepository = {
  list: () => securityRequest<SecurityQuestionDTO[]>(path, { credentials: "include" }),
  async save(dto: UpdateSecurityQuestionsDTO): Promise<void> {
    const csrf = await securityRequest<CsrfDTO>("/auth/csrf", { credentials: "include" });
    if (!csrf.token || !csrf.headerName) throw new Error("Não foi possível obter a proteção CSRF. Tente novamente.");
    await securityRequest<void>(path, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token }, body: JSON.stringify(dto) });
  },
};