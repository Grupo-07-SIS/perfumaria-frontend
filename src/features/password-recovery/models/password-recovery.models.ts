export interface RecoveryQuestion { ordem: number; pergunta: string }
export interface RecoveryChallenge { token: string; expiresAt: string; questions: RecoveryQuestion[] }
export interface ResetAuthorization { token: string; expiresAt: string }
export interface RecoveryAnswer { ordem: number; resposta: string }
export interface PasswordResetValues { novaSenha: string; confirmacao: string }
export type RecoveryState =
  | { step: "email" }
  | { step: "answers"; challenge: RecoveryChallenge }
  | { step: "password"; authorization: ResetAuthorization }
  | { step: "success" };