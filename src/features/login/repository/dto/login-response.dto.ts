export interface LoginResponseDto {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  usuario: {
    donoOrganizacao?: boolean;
    email: string;
    id: string;
    idOrganizacao?: number | null;
    nome: string;
    tipoUsuario: string;
  };
}