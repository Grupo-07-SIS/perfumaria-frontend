import type { Funcionario, FuncionarioModalFormValues, PeopleListParams } from "../models/people.models";
import { funcionariosRepository } from "../repository/funcionarios.repository";
import { toFuncionarioModel, toFuncionarioRequestDto } from "../repository/mapper/funcionario.mapper";

type FuncionarioValues = Omit<FuncionarioModalFormValues, "confirmSenha">;

export async function fetchFuncionarios(params?: PeopleListParams) {
  return (await funcionariosRepository.listFuncionarios(params)).map(toFuncionarioModel);
}
export async function createFuncionario(values: FuncionarioValues) {
  return toFuncionarioModel(await funcionariosRepository.createFuncionario(toFuncionarioRequestDto(values)));
}
export async function updateFuncionario(funcionario: Funcionario, values: FuncionarioValues) {
  return toFuncionarioModel(await funcionariosRepository.updateFuncionario(funcionario.id, toFuncionarioRequestDto(values)));
}
export async function removeFuncionario(funcionario: Funcionario) {
  await funcionariosRepository.deleteFuncionario(funcionario.id);
  return funcionario.id;
}