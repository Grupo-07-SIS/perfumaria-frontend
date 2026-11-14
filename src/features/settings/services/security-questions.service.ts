import { answerValidation, assertThreeOrders, currentPasswordValidation, questionValidation } from "../../../core/security/security.validation";
import { securityQuestionsRepository } from "../repository/security-questions.repository";
import { fromQuestionsDTO, toUpdateQuestionsDTO } from "../repository/mapper/security-questions.mapper";
import type { SecurityQuestionsFormValues } from "../models/security-questions.models";

export const securityQuestionsService = {
  async load() { return fromQuestionsDTO(await securityQuestionsRepository.list()); },
  async save(values: SecurityQuestionsFormValues) {
    const dto = toUpdateQuestionsDTO(values);
    assertThreeOrders(dto.perguntas);
    const checks = [currentPasswordValidation(dto.senhaAtual), ...dto.perguntas.flatMap(pair => [questionValidation(pair.pergunta), answerValidation(pair.resposta)])];
    const failure = checks.find(value => value !== true);
    if (failure) throw new Error(String(failure));
    if (new Set(dto.perguntas.map(pair => pair.pergunta)).size !== 3) throw new Error("As três perguntas devem ser diferentes.");
    await securityQuestionsRepository.save(dto);
  },
};