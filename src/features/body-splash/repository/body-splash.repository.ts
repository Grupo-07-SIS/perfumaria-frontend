import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { BodySplashRequestDto } from "./dto/body-splash-request.dto";
import type { BodySplashPageDto, BodySplashProductDto, BodySplashProductPageDto, BodySplashResponseDto } from "./dto/body-splash-response.dto";

export interface CreateBodySplashProductDto {
  estoqueAtual: number;
  fkCategoria: number;
  marca?: string;
  medida?: "ML" | "L" | "G" | "UNIDADE";
  nome: string;
  precoVenda: number;
  tipoProduto: "BODY_SPLASH";
  volume?: number;
}
export interface BodySplashCategoryDto {
  id: number;
  nome: string;
}

interface ListBodySplashesParams {
  page?: number;
  size?: number;
  produtoId?: number;
  busca?: string;
}

async function requestData<T>(request: Promise<AxiosResponse<T>>, errorCode: string): Promise<T> {
  try {
    return (await request).data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`${errorCode}:${error.response?.status ?? "unknown"}`);
    }
    throw error;
  }
}

export const bodySplashRepository = {
  listBodySplashes(params: ListBodySplashesParams = {}): Promise<BodySplashPageDto> {
    return requestData(apiClient.get<BodySplashPageDto>("/body-splash", {
      params: { page: 0, size: 10, ...params },
    }), "BODY_SPLASH_LIST_FAILED");
  },
  async listProducts(): Promise<BodySplashProductPageDto> {
    const response = await requestData<{
      content: BodySplashProductDto[];
    }>(apiClient.get("/produtos", {
      params: { page: 0, size: 100, ordenacao: "nome,asc", status: 1, tipoProduto: "BODY_SPLASH" },
    }), "BODY_SPLASH_PRODUCTS_LIST_FAILED");
    return response;
  },
  async listCategories(): Promise<BodySplashCategoryDto[]> {
    return requestData(apiClient.get<BodySplashCategoryDto[]>("/categorias"), "BODY_SPLASH_CATEGORIES_LIST_FAILED");
  },
  async createProduct(payload: CreateBodySplashProductDto): Promise<BodySplashProductDto> {
    return requestData(apiClient.post<BodySplashProductDto>("/produtos", payload), "BODY_SPLASH_PRODUCT_CREATE_FAILED");
  },
  createBodySplash(payload: BodySplashRequestDto): Promise<BodySplashResponseDto> {
    return requestData(apiClient.post<BodySplashResponseDto>("/body-splash", payload), "BODY_SPLASH_CREATE_FAILED");
  },
  updateBodySplash(id: number, payload: BodySplashRequestDto): Promise<BodySplashResponseDto> {
    return requestData(apiClient.put<BodySplashResponseDto>(`/body-splash/${id}`, payload), "BODY_SPLASH_UPDATE_FAILED");
  },
  async deleteBodySplash(id: number): Promise<void> {
    await requestData(apiClient.delete<void>(`/body-splash/${id}`), "BODY_SPLASH_DELETE_FAILED");
  },
};
