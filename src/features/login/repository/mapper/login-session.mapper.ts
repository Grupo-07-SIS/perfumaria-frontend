import type { AuthenticatedUser } from "../../../../core/auth/auth.types";
import type { LoginResponseDto } from "../dto/login-response.dto";

function mapRole(tipoUsuario: string): AuthenticatedUser["cargo"] {
  const normalizedRole = tipoUsuario.trim().toUpperCase();

  if (normalizedRole === "ADMIN" || normalizedRole === "ADMINISTRADOR") {
    return "Administrador";
  }

  return "Funcionário";
}

export function toAuthenticatedUser(loginResponse: LoginResponseDto): AuthenticatedUser {
  return {
    cargo: mapRole(loginResponse.usuario.tipoUsuario),
    donoOrganizacao: loginResponse.usuario.donoOrganizacao === true,
    email: loginResponse.usuario.email,
    id: loginResponse.usuario.id,
    idOrganizacao: loginResponse.usuario.idOrganizacao,
    nome: loginResponse.usuario.nome,
  };
}