export interface SecurityQuestionDTO { id?: number | string; ordem: number; pergunta: string }
export interface UpdateSecurityQuestionsDTO {
  senhaAtual: string;
  perguntas: { ordem: number; pergunta: string; resposta: string }[];
}
export interface CsrfDTO { token: string; headerName: string }