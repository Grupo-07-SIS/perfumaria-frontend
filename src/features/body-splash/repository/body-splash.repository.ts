import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { BodySplashRequestDto } from "./dto/body-splash-request.dto";
import type { BodySplashPageDto, BodySplashProductPageDto, BodySplashResponseDto } from "./dto/body-splash-response.dto";

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
  listProducts(): Promise<BodySplashProductPageDto> {
    return requestData(apiClient.get<BodySplashProductPageDto>("/produtos", {
      params: { page: 0, size: 100, ordenacao: "nome,asc" },
    }), "BODY_SPLASH_PRODUCTS_LIST_FAILED");
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
