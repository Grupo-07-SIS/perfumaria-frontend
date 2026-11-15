import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { CategoryRequestDto } from "./dto/category-request.dto";
import type { CategoryResponseDto } from "./dto/category-response.dto";

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

export const categoriesRepository = {
  async createCategory(payload: CategoryRequestDto): Promise<CategoryResponseDto> {
    return requestData(
      apiClient.post<CategoryResponseDto>("/categorias", payload),
      "CATEGORIES_CREATE_FAILED",
    );
  },

  async deleteCategory(categoryId: number): Promise<void> {
    await requestData(
      apiClient.delete<void>(`/categorias/${categoryId}`),
      "CATEGORIES_DELETE_FAILED",
    );
  },

  async listCategories(): Promise<CategoryResponseDto[]> {
    return requestData(
      apiClient.get<CategoryResponseDto[]>("/categorias"),
      "CATEGORIES_LIST_FAILED",
    );
  },

  async updateCategory(categoryId: number, payload: CategoryRequestDto): Promise<CategoryResponseDto> {
    return requestData(
      apiClient.put<CategoryResponseDto>(`/categorias/${categoryId}`, payload),
      "CATEGORIES_UPDATE_FAILED",
    );
  },
};