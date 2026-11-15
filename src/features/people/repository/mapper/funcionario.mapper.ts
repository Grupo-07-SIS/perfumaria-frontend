import type { Funcionario, FuncionarioModalFormValues } from "../../models/people.models";
import type { FuncionarioRequestDto, FuncionarioResponseDto } from "../dto/funcionario.dto";

const USER_TYPE_IDS = { Administrador: 1, Funcionário: 2 } as const;

export function toFuncionarioModel(dto: FuncionarioResponseDto): Funcionario {
  return {
    id: dto.id,
    donoOrganizacao: dto.donoOrganizacao === true,
    nome: dto.nome,
    email: dto.email,
    cargo: dto.fkTipoUsuario === USER_TYPE_IDS.Administrador ? "Administrador" : "Funcionário",
  };
}

export function toFuncionarioRequestDto(values: Omit<FuncionarioModalFormValues, "confirmSenha">): FuncionarioRequestDto {
  const request: FuncionarioRequestDto = {
    nome: values.nome,
    email: values.email,
    fkTipoUsuario: USER_TYPE_IDS[values.cargo],
  };
  if (values.senha) request.senha = values.senha;
  return request;
}