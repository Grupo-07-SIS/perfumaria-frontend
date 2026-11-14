import type { SecurityQuestionsFormValues, SecurityQuestion } from "../../models/security-questions.models";
import type { SecurityQuestionDTO, UpdateSecurityQuestionsDTO } from "../dto/security-questions.dto";

export function fromQuestionsDTO(dto: SecurityQuestionDTO[]): SecurityQuestion[] {
  if (!Array.isArray(dto)) throw new Error("Formato de perguntas inválido.");
  if (dto.length > 3 || new Set(dto.map(question => question.ordem)).size !== dto.length || dto.some(question => ![1, 2, 3].includes(question.ordem))) throw new Error("Ordens de perguntas inválidas.");
  if (dto.some(value => typeof value.pergunta !== "string")) throw new Error("Formato de perguntas inválido.");
  return dto.map(({ id, ordem, pergunta }) => ({ id, ordem, pergunta })).sort((a, b) => a.ordem - b.ordem);
}
export function toUpdateQuestionsDTO(values: SecurityQuestionsFormValues): UpdateSecurityQuestionsDTO {
  return { senhaAtual: values.senhaAtual, perguntas: values.perguntas.map(({ ordem, pergunta, resposta }) => ({ ordem, pergunta: pergunta.trim(), resposta })) };
}