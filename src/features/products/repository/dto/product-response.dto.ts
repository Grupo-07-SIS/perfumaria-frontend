import type { ProductMeasure } from "../../models/products.models";

export interface ProductResponseDto {
  categoriaNome: string;
  dataCadastro?: string;
  estoqueAtual: number;
  fkCategoria: number;
  fkOrganizacao?: number;
  genero?: string | null;
  id: number;
  margem?: number | null;
  marca?: string | null;
  medida?: ProductMeasure | null;
  nome: string;
  organizacaoNome?: string;
  precoCompra?: number | null;
  precoVenda: number;
  status: number;
  volume?: number | null;
}

export interface ProductPageDto {
  content: ProductResponseDto[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable?: Record<string, unknown>;
  size: number;
  sort?: Record<string, unknown>;
  totalElements: number;
  totalPages: number;
}