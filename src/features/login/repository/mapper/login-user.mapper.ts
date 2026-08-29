import type { Funcionario } from "../../../../app/context/AppContext";
import type { LoginUserDto } from "../dto/login-user.dto";

export function toLoginUserDto(user: Funcionario): LoginUserDto {
  return {
    cargo: user.cargo,
    email: user.email,
    id: String(user.id),
    nome: user.nome,
    senha: user.senha,
  };
}