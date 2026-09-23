import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { ClientePageDto, ClienteRequestDto, ClienteResponseDto } from "./dto/cliente.dto";

async function requestData<T>(request: Promise<AxiosResponse<T>>, errorCode: string): Promise<T> {
  try {
    return (await request).data;
  } catch (error) {
    if (axios.isAxiosError(error)) throw new Error(`${errorCode}:${error.response?.status ?? "unknown"}`);
    throw error;
  }
}

export const clientesRepository = {
  async listClientes(): Promise<ClienteResponseDto[]> {
    const page = await requestData(apiClient.get<ClientePageDto>("/clientes", {
      params: { page: 0, size: 100 },
    }), "PEOPLE_CLIENTS_LIST_FAILED");
    return page.content;
  },
  createCliente(payload: ClienteRequestDto): Promise<ClienteResponseDto> {
    return requestData(apiClient.post<ClienteResponseDto>("/clientes", payload), "PEOPLE_CLIENTS_CREATE_FAILED");
  },
  updateCliente(id: number, payload: ClienteRequestDto): Promise<ClienteResponseDto> {
    return requestData(apiClient.put<ClienteResponseDto>(`/clientes/${id}`, payload), "PEOPLE_CLIENTS_UPDATE_FAILED");
  },
  async deleteCliente(id: number): Promise<void> {
    await requestData(apiClient.delete<void>(`/clientes/${id}`), "PEOPLE_CLIENTS_DELETE_FAILED");
  },
};