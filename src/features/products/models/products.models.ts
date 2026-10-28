export type ProductStockStatus = "ok" | "critico" | "esgotado";

export type ProductMeasure = "ML" | "L" | "G" | "UNIDADE";
export type ProductType = "PERFUME" | "BODY_SPLASH" | "OUTRO";

export type ProductStatusFilter = "todos" | ProductStockStatus;

export type ProductSortField =
  | "nome"
  | "marca"
  | "categoriaNome"
  | "volume"
  | "estoqueAtual"
  | "precoVenda"
  | "precoCompra"
  | "margem"
  | "estoqueStatus";

export interface ProductCategoryOption {
  id: number;
  nome: string;
}

export interface Product {
  ativo: number;
  categoriaId: number;
  categoriaNome: string;
  dataCadastro?: string;
  estoqueAtual: number;
  id: number;
  margem?: number;
  marca: string;
  medida?: ProductMeasure;
  nome: string;
  tipoProduto?: ProductType;
  precoCompra?: number;
  precoVenda: number;
  volume?: number;
}

export interface ProductListItem extends Product {
  estoqueStatus: ProductStockStatus;
  margemCalculada: number | null;
  volumeLabel: string | null;
}

export interface ProductDeleteTarget {
  categoriaNome: string;
  id: number;
  nome: string;
}

export interface ProductFormTarget extends Product {}

export interface ProductFormData {
  categoriaId: string;
  estoqueAtual: string;
  hasVolume: boolean;
  marca: string;
  medida: ProductMeasure;
  nome: string;
  precoCompra: string;
  precoVenda: string;
  volume: string;
}