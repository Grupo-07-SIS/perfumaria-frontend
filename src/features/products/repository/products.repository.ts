import { environment } from "../../../environment";
import { PRODUCTS_PAGE_SIZE } from "../config/products.config";
import type { ProductCategoryResponseDto } from "./dto/product-category-response.dto";
import type { ProductRequestDto } from "./dto/product-request.dto";
import type { ProductPageDto, ProductResponseDto } from "./dto/product-response.dto";

interface ListProductsParams {
  categoriaId?: number;
  estoqueMin?: number;
  estoqueMax?: number;
  nome?: string;
  ordenacao?: string;
  page?: number;
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

  async listProducts({ categoriaId, estoqueMin, estoqueMax, nome, ordenacao = "nome,asc", page = 0 }: ListProductsParams = {}): Promise<ProductPageDto> {
    const searchParams = new URLSearchParams({
      ordenacao,
      page: String(page),
      size: String(PRODUCTS_PAGE_SIZE),
    });

    if (nome?.trim()) {
      searchParams.set("nome", nome.trim());
    }

    if (categoriaId !== undefined) searchParams.set("categoriaId", String(categoriaId));
    if (estoqueMin !== undefined) searchParams.set("estoqueMin", String(estoqueMin));
    if (estoqueMax !== undefined) searchParams.set("estoqueMax", String(estoqueMax));

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