import { environment } from "../../../environment";
import type { CategoryRequestDto } from "./dto/category-request.dto";
import type { CategoryResponseDto } from "./dto/category-response.dto";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export const categoriesRepository = {
  async createCategory(payload: CategoryRequestDto): Promise<CategoryResponseDto> {
    const response = await fetch(`${environment.backendUrl}/categorias`, {
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`CATEGORIES_CREATE_FAILED:${response.status}`);
    }

    return parseJsonResponse<CategoryResponseDto>(response);
  },

  async deleteCategory(categoryId: number): Promise<void> {
    const response = await fetch(`${environment.backendUrl}/categorias/${categoryId}`, {
      credentials: "include",
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`CATEGORIES_DELETE_FAILED:${response.status}`);
    }
  },

  async listCategories(): Promise<CategoryResponseDto[]> {
    const response = await fetch(`${environment.backendUrl}/categorias`, {
      credentials: "include",
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`CATEGORIES_LIST_FAILED:${response.status}`);
    }

    return parseJsonResponse<CategoryResponseDto[]>(response);
  },

  async updateCategory(categoryId: number, payload: CategoryRequestDto): Promise<CategoryResponseDto> {
    const response = await fetch(`${environment.backendUrl}/categorias/${categoryId}`, {
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error(`CATEGORIES_UPDATE_FAILED:${response.status}`);
    }

    return parseJsonResponse<CategoryResponseDto>(response);
  },
};