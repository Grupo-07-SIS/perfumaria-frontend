export interface LoginResponseDto {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  usuario: {
    email: string;
    id: string;
    nome: string;
    tipoUsuario: string;
  };
}