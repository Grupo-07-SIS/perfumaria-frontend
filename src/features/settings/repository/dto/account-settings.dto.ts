export interface ChangePasswordRequestDto {
  senhaAtual: string;
  novaSenha: string;
}

export interface ChangeEmailRequestDto {
  senhaAtual: string;
  novoEmail: string;
}

export interface AccountSessionResponseDto {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  usuario: {
    email: string;
    id: string;
    idOrganizacao?: number | null;
    nome: string;
    tipoUsuario: string;
  };
}