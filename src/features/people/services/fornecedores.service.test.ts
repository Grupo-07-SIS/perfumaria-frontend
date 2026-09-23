import { beforeEach, describe, expect, it, vi } from "vitest";

const { createFornecedorMock, deleteFornecedorMock, listFornecedoresMock, updateFornecedorMock } = vi.hoisted(() => ({
  createFornecedorMock: vi.fn(),
  deleteFornecedorMock: vi.fn(),
  listFornecedoresMock: vi.fn(),
  updateFornecedorMock: vi.fn(),
}));

vi.mock("../repository/fornecedores.repository", () => ({
  fornecedoresRepository: {
    createFornecedor: createFornecedorMock,
    deleteFornecedor: deleteFornecedorMock,
    listFornecedores: listFornecedoresMock,
    updateFornecedor: updateFornecedorMock,
  },
}));

import { createFornecedor, fetchFornecedores, removeFornecedor, updateFornecedor } from "./fornecedores.service";

const endereco = {
  logradouro: "Rua das Essencias",
  numero: "120",
  complemento: "Galpao 2",
  cep: "01001-000",
  bairro: "Centro",
  cidade: "Sao Paulo",
  uf: "SP",
};
const values = {
  razaoSocial: "Essencias Brasil Ltda",
  cnpj: "12345678000190",
  telefone: "1133334444",
  email: "contato@essencias.test",
  endereco,
};
const response = { id: 31, nome: values.razaoSocial, cnpj: values.cnpj, telefone: values.telefone, email: values.email, endereco, totalCompras: 8 };
const model = { id: 31, ...values, totalCompras: 8 };
const request = { nome: values.razaoSocial, cnpj: values.cnpj, telefone: values.telefone, email: values.email, endereco };

describe("fornecedoresService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("encaminha busca e mapeia a listagem remota", async () => {
    listFornecedoresMock.mockResolvedValue([response]);

    await expect(fetchFornecedores({ busca: "Essencias" })).resolves.toEqual([model]);
    expect(listFornecedoresMock).toHaveBeenCalledWith({ busca: "Essencias" });
  });

  it("mapeia criacao e atualizacao sem fkOrganizacao", async () => {
    createFornecedorMock.mockResolvedValue(response);
    updateFornecedorMock.mockResolvedValue({ ...response, nome: "Essencias Brasil Revisada" });

    await expect(createFornecedor(values)).resolves.toEqual(model);
    await expect(updateFornecedor(model, { ...values, razaoSocial: "Essencias Brasil Revisada" }))
      .resolves.toEqual({ ...model, razaoSocial: "Essencias Brasil Revisada" });
    expect(createFornecedorMock).toHaveBeenCalledWith(request);
    expect(updateFornecedorMock).toHaveBeenCalledWith(31, { ...request, nome: "Essencias Brasil Revisada" });
    expect(createFornecedorMock.mock.calls[0][0]).not.toHaveProperty("fkOrganizacao");
  });

  it("exclui o fornecedor e retorna seu id", async () => {
    deleteFornecedorMock.mockResolvedValue(undefined);

    await expect(removeFornecedor(model)).resolves.toBe(31);
    expect(deleteFornecedorMock).toHaveBeenCalledWith(31);
  });
});