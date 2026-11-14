export interface SecurityQuestion { id?: number | string; ordem: number; pergunta: string }
export interface SecurityQuestionPair extends SecurityQuestion { resposta: string }
export interface SecurityQuestionsFormValues { senhaAtual: string; perguntas: SecurityQuestionPair[] }