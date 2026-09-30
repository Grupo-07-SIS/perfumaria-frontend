import axios, { type AxiosResponse } from "axios";
import { apiClient } from "../../../core/services/http-client";
import type { PeopleListParams } from "../models/people.models";
import type { FuncionarioRequestDto, FuncionarioResponseDto } from "./dto/funcionario.dto";

async function requestData<T>(request: Promise<AxiosResponse<T>>, errorCode: string): Promise<T> {
  try {
    return (await request).data;
  } catch (error) {
    if (axios.isAxiosError(error)) throw new Error(`${errorCode}:${error.response?.status ?? "unknown"}`);
    throw error;
  }
}

export const funcionariosRepository = {
  listFuncionarios(params: PeopleListParams = {}): Promise<FuncionarioResponseDto[]> {
    const request = Object.keys(params).length > 0
      ? apiClient.get<FuncionarioResponseDto[]>("/funcionarios", { params })
      : apiClient.get<FuncionarioResponseDto[]>("/funcionarios");
    return requestData(request, "PEOPLE_EMPLOYEES_LIST_FAILED");
  },
  createFuncionario(payload: FuncionarioRequestDto): Promise<FuncionarioResponseDto> {
    return requestData(apiClient.post<FuncionarioResponseDto>("/funcionarios", payload), "PEOPLE_EMPLOYEES_CREATE_FAILED");
  },
  updateFuncionario(id: string, payload: FuncionarioRequestDto): Promise<FuncionarioResponseDto> {
    return requestData(apiClient.put<FuncionarioResponseDto>(`/funcionarios/${id}`, payload), "PEOPLE_EMPLOYEES_UPDATE_FAILED");
  },
  async deleteFuncionario(id: string): Promise<void> {
    await requestData(apiClient.delete<void>(`/funcionarios/${id}`), "PEOPLE_EMPLOYEES_DELETE_FAILED");
  },
};