export type Section = "estoque" | "seguranca";
export interface SettingsFormValues {
  criticoLimit: string;
  senhaAtual: string;
  novaSenha: string;
  confirmSenha: string;
  novoEmail: string;
  confirmEmail: string;
  senhaConfEmail: string;
}
