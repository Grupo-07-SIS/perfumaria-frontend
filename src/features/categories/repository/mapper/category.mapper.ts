import type { Category } from "../../models/categories.models";
import type { CategoryRequestDto } from "../dto/category-request.dto";
import type { CategoryResponseDto } from "../dto/category-response.dto";

export function toCategoryModel(category: CategoryResponseDto): Category {
  return {
    id: category.id,
    linkedProducts: category.qtdProdVinculados,
    nome: category.nome,
  };
}

export function toCategoryRequestDto(nome: string): CategoryRequestDto {
  return {
    nome: nome.trim(),
  };
}