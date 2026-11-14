export interface StartRecoveryDTO { email: string }
export interface RecoveryChallengeDTO { tokenDesafio: string; expiraEm: string; perguntas: { ordem: number; pergunta: string }[] }
export interface VerifyRecoveryDTO { respostas: { ordem: number; resposta: string }[] }
export interface ResetAuthorizationDTO { tokenRedefinicao: string; expiraEm: string }
export interface ResetPasswordDTO { novaSenha: string; confirmacao: string }