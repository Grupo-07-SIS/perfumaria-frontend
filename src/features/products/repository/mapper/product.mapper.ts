import type {
  Product,
  ProductCategoryOption,
  ProductFormData,
} from "../../models/products.models";
import type { ProductCategoryResponseDto } from "../dto/product-category-response.dto";
import type { ProductRequestDto } from "../dto/product-request.dto";
import type { ProductResponseDto } from "../dto/product-response.dto";

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

export function toProductCategoryOption(dto: ProductCategoryResponseDto): ProductCategoryOption {
  return {
    id: dto.id,
    nome: dto.nome,
  };
}

export function toProductModel(dto: ProductResponseDto): Product {
  return {
    ativo: dto.status,
    categoriaId: dto.fkCategoria,
    categoriaNome: dto.categoriaNome,
    dataCadastro: dto.dataCadastro,
    estoqueAtual: dto.estoqueAtual,
    id: dto.id,
    margem: dto.margem ?? undefined,
    marca: dto.marca ?? "",
    medida: dto.medida ?? undefined,
    nome: dto.nome,
    precoCompra: dto.precoCompra ?? undefined,
    precoVenda: dto.precoVenda,
    tipoProduto: dto.tipoProduto ?? "PERFUME",
    volume: dto.volume ?? undefined,
  };
}

export function toProductRequestDto(formData: ProductFormData): ProductRequestDto {
  const requestDto: ProductRequestDto = {
    estoqueAtual: Number(formData.estoqueAtual),
    fkCategoria: Number(formData.categoriaId),
    nome: formData.nome.trim(),
    precoVenda: parseDecimal(formData.precoVenda),
    tipoProduto: "PERFUME",
  };

  const marca = formData.marca.trim();
  if (marca) {
    requestDto.marca = marca;
  }

  const precoCompra = formData.precoCompra.trim();
  if (precoCompra) {
    requestDto.precoCompra = parseDecimal(precoCompra);
  }

  if (formData.hasVolume) {
    const volume = formData.volume.trim();
    if (volume) {
      requestDto.volume = parseDecimal(volume);
      requestDto.medida = formData.medida;
    }
  }

  return requestDto;
}