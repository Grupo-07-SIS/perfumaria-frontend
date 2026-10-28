import type {
  Product,
  ProductCategoryOption,
  ProductDeleteTarget,
  ProductFormData,
  ProductFormTarget,
} from "../models/products.models";
import { productsRepository } from "../repository/products.repository";
import {
  toProductCategoryOption,
  toProductModel,
  toProductRequestDto,
} from "../repository/mapper/product.mapper";

interface FetchProductsParams {
  categoriaId?: number;
  estoqueMin?: number;
  estoqueMax?: number;
  nome?: string;
  ordenacao?: string;
  page?: number;
  tipoProduto?: string;
}

export async function fetchProducts(params: FetchProductsParams = {}) {
  const productPage = await productsRepository.listProducts(params);
  return {
    content: productPage.content.map(toProductModel),
    number: productPage.number,
    totalElements: productPage.totalElements,
    totalPages: productPage.totalPages,
  };
}

export async function fetchProductCategories(): Promise<ProductCategoryOption[]> {
  const categories = await productsRepository.listCategories();

  return categories
    .map(toProductCategoryOption)
    .sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));
}

export async function createProduct(formData: ProductFormData): Promise<Product> {
  const createdProduct = await productsRepository.createProduct(toProductRequestDto(formData));
  return toProductModel(createdProduct);
}

export async function updateProduct(target: ProductFormTarget, formData: ProductFormData): Promise<Product> {
  const updatedProduct = await productsRepository.updateProduct(target.id, toProductRequestDto(formData));
  return toProductModel(updatedProduct);
}

export async function removeProduct(target: ProductDeleteTarget): Promise<number> {
  await productsRepository.deleteProduct(target.id);
  return target.id;
}