import type { Cliente, ClienteModalFormValues } from "../../models/people.models";
import { onlyDigits } from "../../../../shared/utils/digits";
import type { ClienteRequestDto, ClienteResponseDto } from "../dto/cliente.dto";

export function toClienteModel(dto: ClienteResponseDto): Cliente {
  return {
    id: dto.id,
    nome: dto.nome,
    telefone: dto.telefone,
    email: dto.email,
    endereco: dto.endereco,
    ativo: dto.status === 1,
    totalPedidos: dto.totalPedidos,
  };
}

export function toClienteRequestDto(values: ClienteModalFormValues): ClienteRequestDto {
  return {
    nome: values.nome,
    telefone: onlyDigits(values.telefone),
    email: values.email,
    endereco: values.endereco,
  };
}