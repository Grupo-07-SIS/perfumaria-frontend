import type { ProductMeasure } from "../../models/products.models";

export interface ProductRequestDto {
  estoqueAtual: number;
  fkCategoria: number;
  marca?: string;
  medida?: ProductMeasure;
  nome: string;
  precoCompra?: number;
  precoVenda: number;
  volume?: number;
}