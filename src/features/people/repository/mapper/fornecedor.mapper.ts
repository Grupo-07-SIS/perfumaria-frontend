import type { Fornecedor, FornecedorModalFormValues } from "../../models/people.models";
import type { FornecedorRequestDto, FornecedorResponseDto } from "../dto/fornecedor.dto";

export function toFornecedorModel(dto: FornecedorResponseDto): Fornecedor {
  return {
    id: dto.id,
    razaoSocial: dto.nome,
    cnpj: dto.cnpj,
    telefone: dto.telefone,
    email: dto.email,
    endereco: dto.endereco,
    totalCompras: dto.totalCompras ?? 0,
  };
}

export function toFornecedorRequestDto(values: FornecedorModalFormValues): FornecedorRequestDto {
  return {
    nome: values.razaoSocial,
    cnpj: values.cnpj,
    telefone: values.telefone,
    email: values.email,
    endereco: values.endereco,
  };
}