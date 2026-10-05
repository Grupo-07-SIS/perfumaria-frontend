import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
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

async function requestData<T>(request: Promise<AxiosResponse<T>>, errorCode: string): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`${errorCode}:${error.response?.status ?? "unknown"}`);
    }

    throw error;
  }
}

export const productsRepository = {
  async createProduct(payload: ProductRequestDto): Promise<ProductResponseDto> {
    return requestData(
      apiClient.post<ProductResponseDto>("/produtos", payload),
      "PRODUCTS_CREATE_FAILED",
    );
  },

  async deleteProduct(productId: number): Promise<void> {
    await requestData(
      apiClient.delete<void>(`/produtos/${productId}`),
      "PRODUCTS_DELETE_FAILED",
    );
  },

  async listCategories(): Promise<ProductCategoryResponseDto[]> {
    return requestData(
      apiClient.get<ProductCategoryResponseDto[]>("/categorias"),
      "PRODUCTS_CATEGORIES_LIST_FAILED",
    );
  },

  async listProducts({ categoriaId, estoqueMin, estoqueMax, nome, ordenacao = "nome,asc", page = 0 }: ListProductsParams = {}): Promise<ProductPageDto> {
    const params: Record<string, number | string> = {
      ordenacao,
      page,
      size: PRODUCTS_PAGE_SIZE,
    };

    if (nome?.trim()) {
      params.nome = nome.trim();
    }

    if (categoriaId !== undefined) params.categoriaId = categoriaId;
    if (estoqueMin !== undefined) params.estoqueMin = estoqueMin;
    if (estoqueMax !== undefined) params.estoqueMax = estoqueMax;

    return requestData(
      apiClient.get<ProductPageDto>("/produtos", { params }),
      "PRODUCTS_LIST_FAILED",
    );
  },

  async updateProduct(productId: number, payload: ProductRequestDto): Promise<ProductResponseDto> {
    return requestData(
      apiClient.put<ProductResponseDto>(`/produtos/${productId}`, payload),
      "PRODUCTS_UPDATE_FAILED",
    );
  },
};