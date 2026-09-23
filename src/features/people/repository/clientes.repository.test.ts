import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientDeleteMock, apiClientGetMock, apiClientPostMock, apiClientPutMock } = vi.hoisted(() => ({
  apiClientDeleteMock: vi.fn(),
  apiClientGetMock: vi.fn(),
  apiClientPostMock: vi.fn(),
  apiClientPutMock: vi.fn(),
}));

vi.mock("../../../core/services/http-client", () => ({
  apiClient: {
    delete: apiClientDeleteMock,
    get: apiClientGetMock,
    post: apiClientPostMock,
    put: apiClientPutMock,
  },
}));

import { clientesRepository } from "./clientes.repository";

const endereco = {
  logradouro: "Rua das Flores",
  numero: "42",
  complemento: "Apto 7",
  cep: "01001-000",
  bairro: "Centro",
  cidade: "Sao Paulo",
  uf: "SP",
};
const payload = {
  nome: "Ana Lima",
  telefone: "11999990000",
  email: "ana@example.test",
  endereco,
};
const response = { id: 17, ...payload, status: 1, totalPedidos: 3 };

function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe("clientesRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista clientes pelo endpoint paginado e devolve somente page.content", async () => {
    apiClientGetMock.mockResolvedValue({
      data: { content: [response], number: 0, size: 100, totalElements: 1, totalPages: 1 },
    });

    await expect(clientesRepository.listClientes()).resolves.toEqual([response]);
    expect(apiClientGetMock).toHaveBeenCalledWith("/clientes", {
      params: { page: 0, size: 100 },
    });
  });

  it("cria, atualiza e exclui usando exatamente o contrato OpenAPI", async () => {
    apiClientPostMock.mockResolvedValue({ data: response });
    apiClientPutMock.mockResolvedValue({ data: { ...response, nome: "Ana Revisada" } });
    apiClientDeleteMock.mockResolvedValue({ data: undefined });

    await expect(clientesRepository.createCliente(payload)).resolves.toEqual(response);
    await expect(clientesRepository.updateCliente(17, { ...payload, nome: "Ana Revisada" }))
      .resolves.toEqual({ ...response, nome: "Ana Revisada" });
    await expect(clientesRepository.deleteCliente(17)).resolves.toBeUndefined();

    expect(apiClientPostMock).toHaveBeenCalledWith("/clientes", payload);
    expect(apiClientPutMock).toHaveBeenCalledWith("/clientes/17", { ...payload, nome: "Ana Revisada" });
    expect(apiClientDeleteMock).toHaveBeenCalledWith("/clientes/17");
  });

  it.each([
    ["list", "PEOPLE_CLIENTS_LIST_FAILED", () => clientesRepository.listClientes(), apiClientGetMock],
    ["create", "PEOPLE_CLIENTS_CREATE_FAILED", () => clientesRepository.createCliente(payload), apiClientPostMock],
    ["update", "PEOPLE_CLIENTS_UPDATE_FAILED", () => clientesRepository.updateCliente(17, payload), apiClientPutMock],
    ["delete", "PEOPLE_CLIENTS_DELETE_FAILED", () => clientesRepository.deleteCliente(17), apiClientDeleteMock],
  ])("preserva operacao e status no erro de %s", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(422));
    await expect(request()).rejects.toThrow(`${code}:422`);
  });
});