import type { ProductMeasure, ProductStatusFilter } from "../models/products.models";

export const DEFAULT_CRITICAL_STOCK_THRESHOLD = 6;

export const PRODUCTS_PAGE_SIZE = 10;

export const PRODUCT_STATUS_OPTIONS: Array<{ name: string; value: ProductStatusFilter }> = [
  { name: "Todos os status", value: "todos" },
  { name: "OK", value: "ok" },
  { name: "Crítico", value: "critico" },
  { name: "Esgotado", value: "esgotado" },
];

export const PRODUCT_MEASURE_OPTIONS: Array<{ name: string; value: ProductMeasure }> = [
  { name: "ml", value: "ML" },
  { name: "L", value: "L" },
  { name: "g", value: "G" },
  { name: "un", value: "UNIDADE" },
];