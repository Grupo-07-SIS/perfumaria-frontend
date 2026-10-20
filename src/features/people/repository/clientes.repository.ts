import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { PeopleListParams } from "../models/people.models";
import type { ClientePageDto, ClienteRequestDto, ClienteResponseDto } from "./dto/cliente.dto";

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

export const clientesRepository = {
  async listClientes(params: PeopleListParams = {}): Promise<ClienteResponseDto[]> {
    const clientes = new Map<number, ClienteResponseDto>();
    const size = 100;
    let page = 0;
    while (true) {
      const response = await requestData(apiClient.get<ClientePageDto>("/clientes", {
        params: { ...params, page, size },
      }), "PEOPLE_CLIENTS_LIST_FAILED");
      const previousCount = clientes.size;
      response.content.forEach(cliente => clientes.set(cliente.id, cliente));
      if (clientes.size === previousCount || (response.totalPages !== undefined
        ? page + 1 >= response.totalPages : response.content.length < size)) break;
      page += 1;
    }
    return [...clientes.values()];
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
  reactivateCliente(id: number): Promise<ClienteResponseDto | undefined> {
    return requestData(apiClient.patch<ClienteResponseDto | undefined>(`/clientes/${id}/reativar`), "PEOPLE_CLIENTS_REACTIVATE_FAILED");
  },
};