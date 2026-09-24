import type { Fornecedor, FornecedorModalFormValues } from "../models/people.models";
import { fornecedoresRepository } from "../repository/fornecedores.repository";
import { toFornecedorModel, toFornecedorRequestDto } from "../repository/mapper/fornecedor.mapper";

export async function fetchFornecedores(params: { busca?: string } = {}) {
  return (await fornecedoresRepository.listFornecedores(params)).map(toFornecedorModel);
}

export async function createFornecedor(values: FornecedorModalFormValues) {
  return toFornecedorModel(await fornecedoresRepository.createFornecedor(toFornecedorRequestDto(values)));
}

export async function updateFornecedor(fornecedor: Fornecedor, values: FornecedorModalFormValues) {
  return toFornecedorModel(await fornecedoresRepository.updateFornecedor(
    fornecedor.id,
    toFornecedorRequestDto(values),
  ));
}

export async function removeFornecedor(fornecedor: Fornecedor) {
  await fornecedoresRepository.deleteFornecedor(fornecedor.id);
  return fornecedor.id;
}