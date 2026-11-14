import type { SecurityQuestionsFormValues } from "../models/security-questions.models";
export const emptySecurityQuestions = (): SecurityQuestionsFormValues => ({
  senhaAtual: "", perguntas: [1, 2, 3].map(ordem => ({ ordem, pergunta: "", resposta: "" })),
});