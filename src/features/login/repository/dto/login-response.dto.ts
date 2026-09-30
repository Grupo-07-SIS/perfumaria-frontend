export interface LoginResponseDto {
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