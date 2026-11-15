import type { Decant, DecantModalFormValues, PerfumeOption } from "../../models/decants.models";
import type { DecantRequestDto } from "../dto/decant-request.dto";
import type { DecantResponseDto, PerfumeProductDto } from "../dto/decant-response.dto";

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

export function toDecantModel(dto: DecantResponseDto): Decant {
  return {
    id: dto.id,
    perfumeId: dto.perfumeId,
    perfume: dto.perfumeNome,
    preco2ml: dto.preco2ml,
    preco3ml: dto.preco3ml,
    preco5ml: dto.preco5ml,
    preco10ml: dto.preco10ml,
  };
}

export function toPerfumeOption(dto: PerfumeProductDto): PerfumeOption {
  return { id: dto.id, nome: dto.nome };
}

export function toDecantRequestDto(values: DecantModalFormValues): DecantRequestDto {
  return {
    perfumeId: Number(values.perfumeId),
    preco2ml: parseDecimal(values.preco2ml),
    preco3ml: parseDecimal(values.preco3ml),
    preco5ml: parseDecimal(values.preco5ml),
    preco10ml: parseDecimal(values.preco10ml),
  };
}