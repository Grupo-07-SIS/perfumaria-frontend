import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClienteMock, deleteClienteMock, listClientesMock, reactivateClienteMock, updateClienteMock } = vi.hoisted(() => ({
  createClienteMock: vi.fn(),
  deleteClienteMock: vi.fn(),
  listClientesMock: vi.fn(),
  reactivateClienteMock: vi.fn(),
  updateClienteMock: vi.fn(),
}));

vi.mock("../repository/clientes.repository", () => ({
  clientesRepository: {
    createCliente: createClienteMock,
    deleteCliente: deleteClienteMock,
    listClientes: listClientesMock,
    reactivateCliente: reactivateClienteMock,
    updateCliente: updateClienteMock,
  },
}));

import { createCliente, fetchClientes, reactivateCliente, removeCliente, updateCliente } from "./clientes.service";

const endereco = {
  logradouro: "Rua das Flores",
  numero: "42",
  complemento: "Apto 7",
  cep: "01001-000",
  bairro: "Centro",
  cidade: "Sao Paulo",
  uf: "SP",
};
const values = { nome: "Ana Lima", telefone: "11999990000", email: "ana@example.test", endereco };
const response = { id: 17, ...values, status: 1, totalPedidos: 3 };
const model = { id: 17, ...values, ativo: true, totalPedidos: 3 };

describe("clientesService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mapeia a listagem de clientes", async () => {
    listClientesMock.mockResolvedValue([response]);
    await expect(fetchClientes()).resolves.toEqual([model]);
  });

  it("encaminha busca e status para a listagem remota", async () => {
    listClientesMock.mockResolvedValue([response]);

    await expect(fetchClientes({ busca: "Ana", status: 0 })).resolves.toEqual([model]);
    expect(listClientesMock).toHaveBeenCalledWith({ busca: "Ana", status: 0 });
  });

  it("mapeia criacao e atualizacao sem enviar campos somente de resposta", async () => {
    createClienteMock.mockResolvedValue(response);
    updateClienteMock.mockResolvedValue({ ...response, nome: "Ana Revisada" });

    await expect(createCliente(values)).resolves.toEqual(model);
    await expect(updateCliente(model, { ...values, nome: "Ana Revisada" }))
      .resolves.toEqual({ ...model, nome: "Ana Revisada" });
    expect(createClienteMock).toHaveBeenCalledWith(values);
    expect(updateClienteMock).toHaveBeenCalledWith(17, { ...values, nome: "Ana Revisada" });
  });

  it("exclui o cliente e retorna seu id sem chamar endpoint de reativacao", async () => {
    deleteClienteMock.mockResolvedValue(undefined);
    await expect(removeCliente(model)).resolves.toBe(17);
    expect(deleteClienteMock).toHaveBeenCalledWith(17);
  });

  it("reativa o cliente e mapeia a resposta do backend", async () => {
    const inativo = { ...model, ativo: false };
    reactivateClienteMock.mockResolvedValue({ ...response, status: 1 });

    await expect(reactivateCliente(inativo)).resolves.toEqual(model);
    expect(reactivateClienteMock).toHaveBeenCalledWith(17);
  });

  it("marca como ativo quando o backend reativa sem corpo de resposta", async () => {
    const inativo = { ...model, ativo: false };
    reactivateClienteMock.mockResolvedValue(undefined);

    await expect(reactivateCliente(inativo)).resolves.toEqual(model);
  });
});