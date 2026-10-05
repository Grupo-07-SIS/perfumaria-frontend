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

import { fornecedoresRepository } from "./fornecedores.repository";

const endereco = {
  logradouro: "Rua das Essencias",
  numero: "120",
  complemento: "Galpao 2",
  cep: "01001-000",
  bairro: "Centro",
  cidade: "Sao Paulo",
  uf: "SP",
};
const payload = {
  nome: "Essencias Brasil Ltda",
  cnpj: "12345678000190",
  telefone: "1133334444",
  email: "contato@essencias.test",
  endereco,
};
const response = { id: 31, ...payload, totalCompras: 8 };

function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe("fornecedoresRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista fornecedores com busca remota", async () => {
    apiClientGetMock.mockResolvedValue({ data: [response] });

    await expect(fornecedoresRepository.listFornecedores({ busca: "Essencias" })).resolves.toEqual([response]);
    expect(apiClientGetMock).toHaveBeenCalledWith("/fornecedores", {
      params: { busca: "Essencias" },
    });
  });

  it("cria, atualiza e exclui sem enviar fkOrganizacao", async () => {
    const updatePayload = { ...payload, nome: "Essencias Brasil Revisada" };
    apiClientPostMock.mockResolvedValue({ data: response });
    apiClientPutMock.mockResolvedValue({ data: { ...response, nome: updatePayload.nome } });
    apiClientDeleteMock.mockResolvedValue({ data: undefined });

    await expect(fornecedoresRepository.createFornecedor(payload)).resolves.toEqual(response);
    await expect(fornecedoresRepository.updateFornecedor(31, updatePayload))
      .resolves.toEqual({ ...response, nome: updatePayload.nome });
    await expect(fornecedoresRepository.deleteFornecedor(31)).resolves.toBeUndefined();

    expect(payload).not.toHaveProperty("fkOrganizacao");
    expect(apiClientPostMock).toHaveBeenCalledWith("/fornecedores", payload);
    expect(apiClientPutMock).toHaveBeenCalledWith("/fornecedores/31", updatePayload);
    expect(apiClientDeleteMock).toHaveBeenCalledWith("/fornecedores/31");
  });

  it.each([
    ["list", "PEOPLE_SUPPLIERS_LIST_FAILED", () => fornecedoresRepository.listFornecedores(), apiClientGetMock],
    ["create", "PEOPLE_SUPPLIERS_CREATE_FAILED", () => fornecedoresRepository.createFornecedor(payload), apiClientPostMock],
    ["update", "PEOPLE_SUPPLIERS_UPDATE_FAILED", () => fornecedoresRepository.updateFornecedor(31, payload), apiClientPutMock],
    ["delete", "PEOPLE_SUPPLIERS_DELETE_FAILED", () => fornecedoresRepository.deleteFornecedor(31), apiClientDeleteMock],
  ])("preserva operacao e status no erro de %s", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(503));
    await expect(request()).rejects.toThrow(`${code}:503`);
  });
});