import type { ProductMeasure, ProductType } from "../../models/products.models";

export interface ProductRequestDto {
  estoqueAtual: number;
  fkCategoria: number;
  marca?: string;
  medida?: ProductMeasure;
  nome: string;
  precoCompra?: number;
  precoVenda: number;
  tipoProduto: ProductType;
  volume?: number;
}