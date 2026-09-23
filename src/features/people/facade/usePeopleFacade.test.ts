import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createClienteMock,
  createFuncionarioMock,
  fetchClientesMock,
  fetchFuncionariosMock,
  removeClienteMock,
  removeFuncionarioMock,
  setFornecedoresMock,
  updateClienteMock,
  updateFuncionarioMock,
} = vi.hoisted(() => ({
  createClienteMock: vi.fn(),
  createFuncionarioMock: vi.fn(),
  fetchClientesMock: vi.fn(),
  fetchFuncionariosMock: vi.fn(),
  removeClienteMock: vi.fn(),
  removeFuncionarioMock: vi.fn(),
  setFornecedoresMock: vi.fn(),
  updateClienteMock: vi.fn(),
  updateFuncionarioMock: vi.fn(),
}));

vi.mock("../services/clientes.service", () => ({
  createCliente: createClienteMock,
  fetchClientes: fetchClientesMock,
  removeCliente: removeClienteMock,
  updateCliente: updateClienteMock,
}));
vi.mock("../services/funcionarios.service", () => ({
  createFuncionario: createFuncionarioMock,
  fetchFuncionarios: fetchFuncionariosMock,
  removeFuncionario: removeFuncionarioMock,
  updateFuncionario: updateFuncionarioMock,
}));

const endereco = {
  logradouro: "Rua das Flores",
  numero: "42",
  complemento: "Apto 7",
  cep: "01001-000",
  bairro: "Centro",
  cidade: "Sao Paulo",
  uf: "SP",
};
const clienteOriginal = {
  id: 17,
  nome: "Ana Lima",
  telefone: "11999990000",
  email: "ana@example.test",
  endereco,
  ativo: true,
  totalPedidos: 3,
};
const funcionarioOriginal = {
  id: "9ec76c44-24b2-4f23-bfb6-461548173bdd",
  nome: "Beatriz Oliveira",
  email: "beatriz@example.test",
  cargo: "Funcionário" as const,
};
const fornecedorLocal = {
  id: 4,
  razaoSocial: "Frascos Local Ltda",
  cnpj: "12.345.678/0001-90",
  email: "local@example.test",
  telefone: "1133334444",
  endereco,
  totalCompras: 8,
};
const currentUser = {
  id: "admin-local",
  nome: "Admin Local",
  email: "admin@example.test",
  cargo: "Administrador" as const,
};

vi.mock("../repository/people.repository", () => ({
  usePeopleRepository: () => ({
    clientes: [],
    setClientes: vi.fn(),
    fornecedores: [fornecedorLocal],
    setFornecedores: setFornecedoresMock,
    funcionarios: [],
    setFuncionarios: vi.fn(),
    currentUser,
  }),
}));

import { usePeopleFacade } from "./usePeopleFacade";

describe("usePeopleFacade com clientes e funcionarios remotos", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchClientesMock.mockResolvedValue([clienteOriginal]);
    fetchFuncionariosMock.mockResolvedValue([funcionarioOriginal]);
  });

  it("carrega clientes e funcionarios no mount e preserva fornecedor e usuario locais", async () => {
    const { result } = renderHook(() => usePeopleFacade());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.fornecedores).toEqual([fornecedorLocal]);
    expect(result.current.currentUser).toEqual(currentUser);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchClientesMock).toHaveBeenCalledTimes(1);
    expect(fetchFuncionariosMock).toHaveBeenCalledTimes(1);
    expect(result.current.clientes).toEqual([clienteOriginal]);
    expect(result.current.funcionarios).toEqual([funcionarioOriginal]);
    expect(result.current.error).toBe("");
  });

  it("expõe erro de carga e encerra loading quando uma integracao falha", async () => {
    fetchClientesMock.mockRejectedValue(new Error("PEOPLE_CLIENTS_LIST_FAILED:503"));
    const { result } = renderHook(() => usePeopleFacade());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toContain("PEOPLE_CLIENTS_LIST_FAILED:503");
  });

  it("adiciona cliente somente depois do sucesso e mantem o modal aberto na falha", async () => {
    const novoCliente = { ...clienteOriginal, id: 18, nome: "Carla Souza", totalPedidos: 0 };
    let resolveCreate!: (value: typeof novoCliente) => void;
    createClienteMock.mockImplementation(() => new Promise(resolve => { resolveCreate = resolve; }));
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setModal({ type: "cliente" }));

    let savePromise!: Promise<void>;
    act(() => {
      savePromise = result.current.saveCliente({
        nome: novoCliente.nome,
        telefone: novoCliente.telefone,
        email: novoCliente.email,
        endereco,
      });
    });
    expect(result.current.clientes).toEqual([clienteOriginal]);
    expect(result.current.modal?.type).toBe("cliente");

    await act(async () => {
      resolveCreate(novoCliente);
      await savePromise;
    });
    expect(result.current.clientes).toEqual([clienteOriginal, novoCliente]);
    expect(result.current.modal).toBeNull();

    createClienteMock.mockRejectedValueOnce(new Error("PEOPLE_CLIENTS_CREATE_FAILED:500"));
    act(() => result.current.setModal({ type: "cliente" }));
    await act(async () => {
      await expect(result.current.saveCliente({
        nome: "Falha",
        telefone: "11000000000",
        email: "falha@example.test",
        endereco,
      })).rejects.toThrow("PEOPLE_CLIENTS_CREATE_FAILED:500");
    });
    expect(result.current.clientes).toEqual([clienteOriginal, novoCliente]);
    expect(result.current.modal?.type).toBe("cliente");
  });

  it("atualiza e exclui cliente somente apos sucesso, removendo-o da lista", async () => {
    const revisado = { ...clienteOriginal, nome: "Ana Revisada" };
    let resolveUpdate!: (value: typeof revisado) => void;
    let resolveDelete!: (value: number) => void;
    updateClienteMock.mockImplementation(() => new Promise(resolve => { resolveUpdate = resolve; }));
    removeClienteMock.mockImplementation(() => new Promise(resolve => { resolveDelete = resolve; }));
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setModal({ type: "cliente", data: clienteOriginal }));
    let updatePromise!: Promise<void>;
    act(() => {
      updatePromise = result.current.saveCliente({
        nome: revisado.nome,
        telefone: revisado.telefone,
        email: revisado.email,
        endereco,
      });
    });
    expect(result.current.clientes).toEqual([clienteOriginal]);
    await act(async () => {
      resolveUpdate(revisado);
      await updatePromise;
    });
    expect(result.current.clientes).toEqual([revisado]);

    act(() => result.current.requestClientDeletion(revisado));
    let deletePromise!: Promise<void>;
    act(() => { deletePromise = result.current.deleteTarget!.fn(); });
    expect(result.current.clientes).toEqual([revisado]);
    await act(async () => {
      resolveDelete(17);
      await deletePromise;
    });
    expect(result.current.clientes).toEqual([]);
    expect(result.current.deleteTarget).toBeNull();
  });

  it("cria, atualiza e exclui funcionario somente depois do backend confirmar", async () => {
    const criado = { ...funcionarioOriginal, id: "f6a22954-756f-4a79-92db-9f9cd17f5542", nome: "Carlos Novo" };
    const revisado = { ...funcionarioOriginal, cargo: "Administrador" as const };
    createFuncionarioMock.mockResolvedValue(criado);
    updateFuncionarioMock.mockResolvedValue(revisado);
    removeFuncionarioMock.mockResolvedValue(funcionarioOriginal.id);
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setModal({ type: "funcionario" }));
    await act(async () => {
      await result.current.saveFuncionario({
        nome: criado.nome,
        email: criado.email,
        cargo: criado.cargo,
        senha: "senha-segura",
      });
    });
    expect(result.current.funcionarios).toEqual([funcionarioOriginal, criado]);

    act(() => result.current.setModal({ type: "funcionario", data: funcionarioOriginal }));
    await act(async () => {
      await result.current.saveFuncionario({
        nome: revisado.nome,
        email: revisado.email,
        cargo: revisado.cargo,
      });
    });
    expect(result.current.funcionarios).toEqual([revisado, criado]);

    act(() => result.current.requestEmployeeDeletion(revisado));
    await act(async () => { await result.current.deleteTarget!.fn(); });
    expect(result.current.funcionarios).toEqual([criado]);
  });

  it("mantem CRUD de fornecedores exclusivamente no repository local", async () => {
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setModal({ type: "fornecedor", data: fornecedorLocal }));
    act(() => result.current.saveFornecedor({
      razaoSocial: "Frascos Locais Revisada",
      cnpj: fornecedorLocal.cnpj,
      email: fornecedorLocal.email,
      telefone: fornecedorLocal.telefone,
      endereco,
    }));
    expect(setFornecedoresMock).toHaveBeenCalledTimes(1);

    act(() => result.current.requestSupplierDeletion(fornecedorLocal));
    act(() => result.current.deleteTarget!.fn());
    expect(setFornecedoresMock).toHaveBeenCalledTimes(2);
  });
});