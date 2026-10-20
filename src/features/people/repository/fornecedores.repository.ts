import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { FornecedorRequestDto, FornecedorResponseDto } from "./dto/fornecedor.dto";

async function requestData<T>(request: Promise<AxiosResponse<T>>, errorCode: string): Promise<T> {
  try {
    return (await request).data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: unknown; fields?: unknown } | undefined;
      const detail = typeof data?.message === "string" ? `|${data.message}` : "";
      throw Object.assign(new Error(`${errorCode}:${error.response?.status ?? "unknown"}${detail}`), {
        status: error.response?.status, fields: data?.fields,
      });
    }
    throw error;
  }
}

export const fornecedoresRepository = {
  listFornecedores(params: { busca?: string } = {}): Promise<FornecedorResponseDto[]> {
    return requestData(apiClient.get<FornecedorResponseDto[]>("/fornecedores", {
      params,
    }), "PEOPLE_SUPPLIERS_LIST_FAILED");
  },
  createFornecedor(payload: FornecedorRequestDto): Promise<FornecedorResponseDto> {
    return requestData(apiClient.post<FornecedorResponseDto>("/fornecedores", payload), "PEOPLE_SUPPLIERS_CREATE_FAILED");
  },
  updateFornecedor(id: number, payload: FornecedorRequestDto): Promise<FornecedorResponseDto> {
    return requestData(apiClient.put<FornecedorResponseDto>(`/fornecedores/${id}`, payload), "PEOPLE_SUPPLIERS_UPDATE_FAILED");
  },
  async deleteFornecedor(id: number): Promise<void> {
    await requestData(apiClient.delete<void>(`/fornecedores/${id}`), "PEOPLE_SUPPLIERS_DELETE_FAILED");
  },
};