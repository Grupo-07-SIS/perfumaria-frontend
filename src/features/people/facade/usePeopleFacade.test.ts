import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createClienteMock,
  createFornecedorMock,
  createFuncionarioMock,
  fetchClientesMock,
  fetchFornecedoresMock,
  fetchFuncionariosMock,
  reactivateClienteMock,
  removeClienteMock,
  removeFornecedorMock,
  removeFuncionarioMock,
  updateClienteMock,
  updateFornecedorMock,
  updateFuncionarioMock,
} = vi.hoisted(() => ({
  createClienteMock: vi.fn(),
  createFornecedorMock: vi.fn(),
  createFuncionarioMock: vi.fn(),
  fetchClientesMock: vi.fn(),
  fetchFornecedoresMock: vi.fn(),
  fetchFuncionariosMock: vi.fn(),
  reactivateClienteMock: vi.fn(),
  removeClienteMock: vi.fn(),
  removeFornecedorMock: vi.fn(),
  removeFuncionarioMock: vi.fn(),
  updateClienteMock: vi.fn(),
  updateFornecedorMock: vi.fn(),
  updateFuncionarioMock: vi.fn(),
}));

vi.mock("../services/clientes.service", () => ({
  createCliente: createClienteMock,
  fetchClientes: fetchClientesMock,
  reactivateCliente: reactivateClienteMock,
  removeCliente: removeClienteMock,
  updateCliente: updateClienteMock,
}));
vi.mock("../services/funcionarios.service", () => ({
  createFuncionario: createFuncionarioMock,
  fetchFuncionarios: fetchFuncionariosMock,
  removeFuncionario: removeFuncionarioMock,
  updateFuncionario: updateFuncionarioMock,
}));
vi.mock("../services/fornecedores.service", () => ({
  createFornecedor: createFornecedorMock,
  fetchFornecedores: fetchFornecedoresMock,
  removeFornecedor: removeFornecedorMock,
  updateFornecedor: updateFornecedorMock,
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
const fornecedorRemoto = {
  id: 4,
  razaoSocial: "Frascos Remoto Ltda",
  cnpj: "12.345.678/0001-90",
  email: "remoto@example.test",
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
    fornecedores: [],
    setFornecedores: vi.fn(),
    funcionarios: [],
    setFuncionarios: vi.fn(),
    currentUser,
  }),
}));

import { usePeopleFacade } from "./usePeopleFacade";

describe("usePeopleFacade com pessoas remotas", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchClientesMock.mockResolvedValue([clienteOriginal]);
    fetchFornecedoresMock.mockResolvedValue([fornecedorRemoto]);
    fetchFuncionariosMock.mockResolvedValue([funcionarioOriginal]);
  });

  it("carrega clientes, fornecedores e funcionarios juntos no mount", async () => {
    const { result } = renderHook(() => usePeopleFacade());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentUser).toEqual(currentUser);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchClientesMock).toHaveBeenCalledTimes(1);
    expect(fetchFornecedoresMock).toHaveBeenCalledTimes(1);
    expect(fetchFuncionariosMock).toHaveBeenCalledTimes(1);
    expect(result.current.clientes).toEqual([clienteOriginal]);
    expect(result.current.fornecedores).toEqual([fornecedorRemoto]);
    expect(result.current.funcionarios).toEqual([funcionarioOriginal]);
    expect(result.current.error).toBe("");
  });

  it("mantem os resultados remotos enquanto o usuario apenas digita", async () => {
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    vi.clearAllMocks();

    act(() => result.current.setSearch("resultado inexistente"));

    expect(result.current.filtClientes).toEqual([clienteOriginal]);
    expect(fetchClientesMock).not.toHaveBeenCalled();
    expect(fetchFornecedoresMock).not.toHaveBeenCalled();
    expect(fetchFuncionariosMock).not.toHaveBeenCalled();
  });

  it("submete busca somente para a aba ativa e busca clientes de todos os status", async () => {
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    vi.clearAllMocks();

    act(() => {
      result.current.setSearch("Ana");
      result.current.setStatusFiltro("inativos");
    });
    await act(async () => result.current.submitSearch());
    expect(fetchClientesMock).toHaveBeenLastCalledWith({ busca: "Ana" });
    expect(fetchFornecedoresMock).not.toHaveBeenCalled();
    expect(fetchFuncionariosMock).not.toHaveBeenCalled();

    vi.clearAllMocks();
    act(() => result.current.setStatusFiltro("todos"));
    expect(fetchClientesMock).not.toHaveBeenCalled();
    await act(async () => result.current.submitSearch());
    expect(fetchClientesMock).toHaveBeenLastCalledWith({ busca: "Ana" });

    vi.clearAllMocks();
    act(() => {
      result.current.setAba("fornecedores");
      result.current.setSearch("Frascos");
    });
    await act(async () => result.current.submitSearch());
    expect(fetchFornecedoresMock).toHaveBeenLastCalledWith({ busca: "Frascos" });
    expect(fetchClientesMock).not.toHaveBeenCalled();
    expect(fetchFuncionariosMock).not.toHaveBeenCalled();

    vi.clearAllMocks();
    act(() => {
      result.current.setAba("funcionarios");
      result.current.setSearch("Beatriz");
    });
    await act(async () => result.current.submitSearch());
    expect(fetchFuncionariosMock).toHaveBeenLastCalledWith({ busca: "Beatriz" });
    expect(fetchClientesMock).not.toHaveBeenCalled();
    expect(fetchFornecedoresMock).not.toHaveBeenCalled();
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

  it("atualiza e inativa cliente somente apos sucesso, movendo-o para os inativos", async () => {
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
    const inativado = { ...revisado, ativo: false };
    expect(result.current.clientes).toEqual([inativado]);
    expect(result.current.filtClientes).toEqual([]);
    expect(result.current.deleteTarget).toBeNull();

    act(() => result.current.setStatusFiltro("inativos"));
    expect(result.current.filtClientes).toEqual([inativado]);
  });

  it("reativa cliente somente depois do backend confirmar e o devolve aos ativos", async () => {
    const inativo = { ...clienteOriginal, ativo: false };
    fetchClientesMock.mockResolvedValue([inativo]);
    let resolveReactivate!: (value: typeof clienteOriginal) => void;
    reactivateClienteMock.mockImplementation(() => new Promise(resolve => { resolveReactivate = resolve; }));
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filtClientes).toEqual([]);

    act(() => result.current.requestClientReactivation(inativo));
    expect(result.current.reactivateTarget).toEqual(inativo);

    let reactivatePromise!: Promise<void>;
    act(() => { reactivatePromise = result.current.confirmClientReactivation(); });
    expect(result.current.clientes).toEqual([inativo]);
    await act(async () => {
      resolveReactivate(clienteOriginal);
      await reactivatePromise;
    });

    expect(reactivateClienteMock).toHaveBeenCalledWith(inativo);
    expect(result.current.clientes).toEqual([clienteOriginal]);
    expect(result.current.filtClientes).toEqual([clienteOriginal]);
    expect(result.current.reactivateTarget).toBeNull();
  });

  it("mantem o cliente inativo e o alvo aberto quando a reativacao falha", async () => {
    const inativo = { ...clienteOriginal, ativo: false };
    fetchClientesMock.mockResolvedValue([inativo]);
    reactivateClienteMock.mockRejectedValue(new Error("PEOPLE_CLIENTS_REACTIVATE_FAILED:500"));
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.requestClientReactivation(inativo));
    await act(async () => result.current.confirmClientReactivation());

    expect(result.current.clientes).toEqual([inativo]);
    expect(result.current.reactivateTarget).toEqual(inativo);
    expect(result.current.error).toBe("PEOPLE_CLIENTS_REACTIVATE_FAILED:500");
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

  it("cria, atualiza e exclui fornecedor somente depois do backend confirmar", async () => {
    const criado = { ...fornecedorRemoto, id: 32, razaoSocial: "Nova Essencia Ltda" };
    const revisado = { ...fornecedorRemoto, razaoSocial: "Frascos Revisada Ltda" };
    let resolveCreate!: (value: typeof criado) => void;
    let resolveUpdate!: (value: typeof revisado) => void;
    let resolveDelete!: (value: number) => void;
    createFornecedorMock.mockImplementation(() => new Promise(resolve => { resolveCreate = resolve; }));
    updateFornecedorMock.mockImplementation(() => new Promise(resolve => { resolveUpdate = resolve; }));
    removeFornecedorMock.mockImplementation(() => new Promise(resolve => { resolveDelete = resolve; }));
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setModal({ type: "fornecedor" }));
    let createPromise!: Promise<void>;
    act(() => {
      createPromise = result.current.saveFornecedor({
        razaoSocial: criado.razaoSocial,
        cnpj: criado.cnpj,
        email: criado.email,
        telefone: criado.telefone,
        endereco,
      });
    });
    expect(result.current.fornecedores).toEqual([fornecedorRemoto]);
    expect(result.current.modal?.type).toBe("fornecedor");
    await act(async () => {
      resolveCreate(criado);
      await createPromise;
    });
    expect(result.current.fornecedores).toEqual([fornecedorRemoto, criado]);
    expect(result.current.modal).toBeNull();

    act(() => result.current.setModal({ type: "fornecedor", data: fornecedorRemoto }));
    let updatePromise!: Promise<void>;
    act(() => {
      updatePromise = result.current.saveFornecedor({
        razaoSocial: revisado.razaoSocial,
        cnpj: revisado.cnpj,
        email: revisado.email,
        telefone: revisado.telefone,
        endereco,
      });
    });
    expect(result.current.fornecedores[0]).toEqual(fornecedorRemoto);
    await act(async () => {
      resolveUpdate(revisado);
      await updatePromise;
    });
    expect(result.current.fornecedores).toEqual([revisado, criado]);

    act(() => result.current.requestSupplierDeletion(revisado));
    let deletePromise!: Promise<void>;
    act(() => { deletePromise = result.current.deleteTarget!.fn(); });
    expect(result.current.fornecedores).toEqual([revisado, criado]);
    await act(async () => {
      resolveDelete(revisado.id);
      await deletePromise;
    });
    expect(result.current.fornecedores).toEqual([criado]);
    expect(result.current.deleteTarget).toBeNull();
  });

  it("mantem fornecedor e alvos abertos quando uma mutacao remota falha", async () => {
    createFornecedorMock.mockRejectedValueOnce(new Error("PEOPLE_SUPPLIERS_CREATE_FAILED:500"));
    removeFornecedorMock.mockRejectedValueOnce(new Error("PEOPLE_SUPPLIERS_DELETE_FAILED:500"));
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setModal({ type: "fornecedor" }));
    await act(async () => {
      await expect(result.current.saveFornecedor({
        razaoSocial: "Falha Ltda",
        cnpj: fornecedorRemoto.cnpj,
        email: fornecedorRemoto.email,
        telefone: fornecedorRemoto.telefone,
        endereco,
      })).rejects.toThrow("PEOPLE_SUPPLIERS_CREATE_FAILED:500");
    });
    expect(result.current.fornecedores).toEqual([fornecedorRemoto]);
    expect(result.current.modal?.type).toBe("fornecedor");

    act(() => result.current.requestSupplierDeletion(fornecedorRemoto));
    await act(async () => {
      await expect(result.current.deleteTarget!.fn()).rejects.toThrow("PEOPLE_SUPPLIERS_DELETE_FAILED:500");
    });
    expect(result.current.fornecedores).toEqual([fornecedorRemoto]);
    expect(result.current.deleteTarget?.nome).toBe(fornecedorRemoto.razaoSocial);
  });

  it("busca fornecedores dinamicamente enquanto o usuario digita", async () => {
    const encontrado = { ...fornecedorRemoto, id: 9, razaoSocial: "Essencias Ltda" };
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.selectTab("fornecedores"));
    vi.clearAllMocks();
    fetchFornecedoresMock.mockResolvedValue([encontrado]);

    act(() => result.current.setSearch(" Essen "));

    await waitFor(() => expect(result.current.filtFornecedores).toEqual([encontrado]));
    expect(fetchFornecedoresMock).toHaveBeenCalledTimes(1);
    expect(fetchFornecedoresMock).toHaveBeenCalledWith({ busca: "Essen" });
    expect(fetchClientesMock).not.toHaveBeenCalled();
  });

  it("ignora resposta antiga de fornecedores quando uma busca mais nova ja respondeu", async () => {
    const antigo = { ...fornecedorRemoto, id: 10, razaoSocial: "Antigo Ltda" };
    const novo = { ...fornecedorRemoto, id: 11, razaoSocial: "Novo Ltda" };
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.selectTab("fornecedores"));

    let resolveAntigo!: (value: typeof antigo[]) => void;
    fetchFornecedoresMock
      .mockImplementationOnce(() => new Promise(resolve => { resolveAntigo = resolve; }))
      .mockResolvedValueOnce([novo]);

    act(() => result.current.setSearch("Ant"));
    let antigaPromise!: Promise<void>;
    act(() => { antigaPromise = result.current.submitSearch(); });
    act(() => result.current.setSearch("Novo"));
    await act(async () => result.current.submitSearch());
    await act(async () => {
      resolveAntigo([antigo]);
      await antigaPromise;
    });

    expect(result.current.fornecedores).toEqual([novo]);
  });

  it("ao trocar de aba limpa a busca e restaura a lista completa da aba filtrada", async () => {
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.selectTab("fornecedores"));
    fetchFornecedoresMock.mockResolvedValueOnce([]);
    act(() => result.current.setSearch("inexistente"));
    await act(async () => result.current.submitSearch());
    expect(result.current.fornecedores).toEqual([]);

    vi.clearAllMocks();
    fetchFornecedoresMock.mockResolvedValue([fornecedorRemoto]);
    await act(async () => result.current.selectTab("funcionarios"));

    expect(result.current.aba).toBe("funcionarios");
    expect(result.current.search).toBe("");
    expect(result.current.statusFiltro).toBe("ativos");
    expect(fetchFornecedoresMock).toHaveBeenCalledWith({});
    await waitFor(() => expect(result.current.fornecedores).toEqual([fornecedorRemoto]));
    expect(fetchFuncionariosMock).not.toHaveBeenCalled();
  });

  it("conta ativos e inativos da busca e troca o status sem nova requisicao", async () => {
    const inativo = { ...clienteOriginal, id: 30, nome: "Ana Inativa", ativo: false };
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    fetchClientesMock.mockResolvedValue([clienteOriginal, inativo]);
    act(() => result.current.setSearch("Ana"));
    await act(async () => result.current.submitSearch());
    vi.clearAllMocks();

    expect(result.current.clientesAtivos).toEqual([clienteOriginal]);
    expect(result.current.clientesInativos).toEqual([inativo]);
    expect(result.current.filtClientes).toEqual([clienteOriginal]);

    act(() => result.current.setStatusFiltro("inativos"));

    expect(fetchClientesMock).not.toHaveBeenCalled();
    expect(result.current.filtClientes).toEqual([inativo]);
  });

  it("filtra status de clientes localmente quando nao ha busca ativa", async () => {
    const { result } = renderHook(() => usePeopleFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    vi.clearAllMocks();

    act(() => result.current.setStatusFiltro("inativos"));

    expect(fetchClientesMock).not.toHaveBeenCalled();
    expect(result.current.filtClientes).toEqual([]);
  });
});