export interface FuncionarioRequestDto {
  nome: string;
  email: string;
  senha?: string;
  fkTipoUsuario: number;
}

export interface FuncionarioResponseDto {
  id: string;
  donoOrganizacao?: boolean;
  nome: string;
  email: string;
  fkTipoUsuario: number;
  tipoUsuarioNome: string;
}