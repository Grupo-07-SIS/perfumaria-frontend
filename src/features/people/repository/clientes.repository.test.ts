import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientDeleteMock, apiClientGetMock, apiClientPatchMock, apiClientPostMock, apiClientPutMock } = vi.hoisted(() => ({
  apiClientDeleteMock: vi.fn(),
  apiClientGetMock: vi.fn(),
  apiClientPatchMock: vi.fn(),
  apiClientPostMock: vi.fn(),
  apiClientPutMock: vi.fn(),
}));

vi.mock("../../../core/services/http-client", () => ({
  apiClient: {
    delete: apiClientDeleteMock,
    get: apiClientGetMock,
    patch: apiClientPatchMock,
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

  it("envia busca e status junto da paginacao", async () => {
    apiClientGetMock.mockResolvedValue({
      data: { content: [response], number: 0, size: 100, totalElements: 1, totalPages: 1 },
    });

    await clientesRepository.listClientes({ busca: "Ana", status: 1 });

    expect(apiClientGetMock).toHaveBeenCalledWith("/clientes", {
      params: { page: 0, size: 100, busca: "Ana", status: 1 },
    });
  });

  it("carrega clientes alem dos primeiros 100 preservando os filtros", async () => {
    const clientes = Array.from({ length: 101 }, (_, index) => ({ ...response, id: index + 1 }));
    apiClientGetMock.mockResolvedValueOnce({ data: { content: clientes.slice(0, 100), totalPages: 2 } })
      .mockResolvedValueOnce({ data: { content: clientes.slice(100), totalPages: 2 } });
    await expect(clientesRepository.listClientes({ busca: "Ana", status: 1 })).resolves.toEqual(clientes);
    expect(apiClientGetMock).toHaveBeenNthCalledWith(2, "/clientes", { params: { page: 1, size: 100, busca: "Ana", status: 1 } });
    expect(apiClientGetMock).toHaveBeenCalledTimes(2);
  });

  it("interrompe a paginacao se o servidor repetir a mesma pagina", async () => {
    apiClientGetMock.mockResolvedValue({ data: { content: [response], totalPages: 3 } });
    await expect(clientesRepository.listClientes()).resolves.toEqual([response]);
    expect(apiClientGetMock).toHaveBeenCalledTimes(2);
  });

  it("nao apresenta uma lista parcial como completa se uma pagina falhar", async () => {
    apiClientGetMock.mockResolvedValueOnce({ data: { content: [response], totalPages: 2 } })
      .mockRejectedValueOnce(axiosError(503));
    await expect(clientesRepository.listClientes()).rejects.toThrow("PEOPLE_CLIENTS_LIST_FAILED:503");
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

  it("reativa o cliente pelo endpoint PATCH dedicado", async () => {
    apiClientPatchMock.mockResolvedValue({ data: response });

    await expect(clientesRepository.reactivateCliente(17)).resolves.toEqual(response);
    expect(apiClientPatchMock).toHaveBeenCalledWith("/clientes/17/reativar");
  });

  it.each([
    ["list", "PEOPLE_CLIENTS_LIST_FAILED", () => clientesRepository.listClientes(), apiClientGetMock],
    ["create", "PEOPLE_CLIENTS_CREATE_FAILED", () => clientesRepository.createCliente(payload), apiClientPostMock],
    ["update", "PEOPLE_CLIENTS_UPDATE_FAILED", () => clientesRepository.updateCliente(17, payload), apiClientPutMock],
    ["delete", "PEOPLE_CLIENTS_DELETE_FAILED", () => clientesRepository.deleteCliente(17), apiClientDeleteMock],
    ["reactivate", "PEOPLE_CLIENTS_REACTIVATE_FAILED", () => clientesRepository.reactivateCliente(17), apiClientPatchMock],
  ])("preserva operacao e status no erro de %s", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(422));
    await expect(request()).rejects.toThrow(`${code}:422`);
  });
});