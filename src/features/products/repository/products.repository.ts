import { environment } from "../../../environment";
import { PRODUCTS_PAGE_SIZE } from "../config/products.config";
import type { ProductCategoryResponseDto } from "./dto/product-category-response.dto";
import type { ProductRequestDto } from "./dto/product-request.dto";
import type { ProductPageDto, ProductResponseDto } from "./dto/product-response.dto";

interface ListProductsParams {
  nome?: string;
  ordenacao?: string;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export const productsRepository = {
  async createProduct(payload: ProductRequestDto): Promise<ProductResponseDto> {
    const response = await fetch(`${environment.backendUrl}/produtos`, {
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`PRODUCTS_CREATE_FAILED:${response.status}`);
    }

    return parseJsonResponse<ProductResponseDto>(response);
  },

  async deleteProduct(productId: number): Promise<void> {
    const response = await fetch(`${environment.backendUrl}/produtos/${productId}`, {
      credentials: "include",
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`PRODUCTS_DELETE_FAILED:${response.status}`);
    }
  },

  async listCategories(): Promise<ProductCategoryResponseDto[]> {
    const response = await fetch(`${environment.backendUrl}/categorias`, {
      credentials: "include",
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`PRODUCTS_CATEGORIES_LIST_FAILED:${response.status}`);
    }

    return parseJsonResponse<ProductCategoryResponseDto[]>(response);
  },

  async listProducts({ nome, ordenacao = "nome,asc" }: ListProductsParams = {}): Promise<ProductPageDto> {
    const searchParams = new URLSearchParams({
      ordenacao,
      page: "0",
      size: String(Math.min(100, Math.max(PRODUCTS_PAGE_SIZE, 100))),
    });

    if (nome?.trim()) {
      searchParams.set("nome", nome.trim());
    }

    const response = await fetch(`${environment.backendUrl}/produtos?${searchParams.toString()}`, {
      credentials: "include",
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`PRODUCTS_LIST_FAILED:${response.status}`);
    }

    return parseJsonResponse<ProductPageDto>(response);
  },

  async updateProduct(productId: number, payload: ProductRequestDto): Promise<ProductResponseDto> {
    const response = await fetch(`${environment.backendUrl}/produtos/${productId}`, {
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error(`PRODUCTS_UPDATE_FAILED:${response.status}`);
    }

    return parseJsonResponse<ProductResponseDto>(response);
  },
};