import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { DecantRequestDto } from "./dto/decant-request.dto";
import type { DecantPageDto, DecantResponseDto, PerfumeProductDto, PerfumeProductPageDto } from "./dto/decant-response.dto";

interface ListDecantsParams {
  page?: number;
  size?: number;
  perfumeId?: number;
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

export const decantsRepository = {
  listDecants(params: ListDecantsParams = {}): Promise<DecantPageDto> {
    return requestData(apiClient.get<DecantPageDto>("/decants", {
      params: { page: 0, size: 10, ...params },
    }), "DECANTS_LIST_FAILED");
  },
  async listPerfumeProducts(): Promise<PerfumeProductPageDto> {
    const response = await requestData<{
      content: PerfumeProductDto[];
    }>(apiClient.get("/produtos", {
      params: { page: 0, size: 100, ordenacao: "nome,asc", status: 1, tipoProduto: "PERFUME" },
    }), "DECANTS_PRODUCTS_LIST_FAILED");
    return response;
  },
  createDecant(payload: DecantRequestDto): Promise<DecantResponseDto> {
    return requestData(apiClient.post<DecantResponseDto>("/decants", payload), "DECANTS_CREATE_FAILED");
  },
  updateDecant(id: number, payload: DecantRequestDto): Promise<DecantResponseDto> {
    return requestData(apiClient.put<DecantResponseDto>(`/decants/${id}`, payload), "DECANTS_UPDATE_FAILED");
  },
  async deleteDecant(id: number): Promise<void> {
    await requestData(apiClient.delete<void>(`/decants/${id}`), "DECANTS_DELETE_FAILED");
  },
};
