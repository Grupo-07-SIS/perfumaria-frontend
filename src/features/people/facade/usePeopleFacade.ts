import { createPeopleTabs } from "../config/people.presentation";
import { buildClienteSearchParams, buildSearchParams, selectPeople } from "../services/people.service";
import { usePeopleRepository } from "../repository/people.repository";
import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import type { Aba, Cliente, ClienteModalFormValues, Fornecedor, FornecedorModalFormValues, Funcionario, FuncionarioModalFormValues, StatusFiltro } from "../models/people.models";
import { createCliente, fetchClientes, removeCliente, updateCliente } from "../services/clientes.service";
import { createFornecedor, fetchFornecedores, removeFornecedor, updateFornecedor } from "../services/fornecedores.service";
import { createFuncionario, fetchFuncionarios, removeFuncionario, updateFuncionario } from "../services/funcionarios.service";

export function usePeopleFacade() {
  const {
    currentUser
  } = usePeopleRepository();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = currentUser?.cargo === "Administrador";
  const [aba, setAba] = useState<Aba>("clientes");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const listRequestIds = useRef<Record<Aba, number>>({ clientes: 0, fornecedores: 0, funcionarios: 0 });
  const [statusFiltro, setStatusFiltroState] = useState<StatusFiltro>("ativos");
  type ModalState = {
    type: "cliente";
    data?: Cliente;
  } | {
    type: "fornecedor";
    data?: Fornecedor;
  } | {
    type: "funcionario";
    data?: Funcionario;
  } | null;
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    nome: string;
    fn: () => void | Promise<void>;
  } | null>(null);
  const [inativarTarget, setInativarTarget] = useState<Cliente | null>(null);
  const clientesAtivos = clientes.filter(c => c.ativo !== false);
  const clientesInativos = clientes.filter(c => c.ativo === false);
  const allTabs = createPeopleTabs(clientesAtivos.length, fornecedores.length, funcionarios.length);
  const tabs = allTabs.filter(t => isAdmin || !t.adminOnly);
  const startListRequest = (tab: Aba) => ++listRequestIds.current[tab];
  const isLatestListRequest = (tab: Aba, requestId: number) => listRequestIds.current[tab] === requestId;

  useEffect(() => {
    const requestIds = {
      clientes: startListRequest("clientes"),
      fornecedores: startListRequest("fornecedores"),
      funcionarios: startListRequest("funcionarios")
    };
    Promise.all([fetchClientes(), fetchFornecedores(), fetchFuncionarios()])
      .then(([loadedClientes, loadedFornecedores, loadedFuncionarios]) => {
        if (isLatestListRequest("clientes", requestIds.clientes)) setClientes(loadedClientes);
        if (isLatestListRequest("fornecedores", requestIds.fornecedores)) setFornecedores(loadedFornecedores);
        if (isLatestListRequest("funcionarios", requestIds.funcionarios)) setFuncionarios(loadedFuncionarios);
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar pessoas."))
      .finally(() => setIsLoading(false));
  }, []);

  const loadTab = async (tab: Aba, busca: string, status: StatusFiltro) => {
    const requestId = startListRequest(tab);
    setError("");
    try {
      if (tab === "clientes") {
        const loaded = await fetchClientes(buildClienteSearchParams(busca, status));
        if (isLatestListRequest(tab, requestId)) setClientes(loaded);
      } else if (tab === "fornecedores") {
        const loaded = await fetchFornecedores(buildSearchParams(busca));
        if (isLatestListRequest(tab, requestId)) setFornecedores(loaded);
      } else {
        const loaded = await fetchFuncionarios(buildSearchParams(busca));
        if (isLatestListRequest(tab, requestId)) setFuncionarios(loaded);
      }
    } catch (loadError) {
      if (isLatestListRequest(tab, requestId)) setError(loadError instanceof Error ? loadError.message : "Não foi possível buscar pessoas.");
    }
  };

  const searchActiveTab = (busca: string) => {
    setSubmittedSearch(busca);
    return loadTab(aba, busca, statusFiltro);
  };

  const submitSearch = () => searchActiveTab(search.trim());

  useEffect(() => {
    if (debouncedSearch === submittedSearch) return;
    void searchActiveTab(debouncedSearch);
  }, [debouncedSearch]);

  const setStatusFiltro = (status: StatusFiltro) => {
    setStatusFiltroState(status);
    if (aba === "clientes" && submittedSearch) void loadTab("clientes", submittedSearch, status);
  };

  const selectTab = (nextAba: Aba) => {
    if (submittedSearch) void loadTab(aba, "", "todos");
    setAba(nextAba);
    setSearch("");
    setSubmittedSearch("");
    setStatusFiltroState("ativos");
  };

  const saveCliente = async (values: ClienteModalFormValues) => {
    const cd = modal?.type === "cliente" && modal.data ? modal.data : null;
    setError("");
    try {
      const saved = cd ? await updateCliente(cd, values) : await createCliente(values);
      setClientes(prev => cd
        ? prev.map(cliente => cliente.id === saved.id ? saved : cliente)
        : [...prev, saved]);
      setModal(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o cliente.");
      throw requestError;
    }
  };
  const saveFornecedor = async (values: FornecedorModalFormValues) => {
    const fd = modal?.type === "fornecedor" && modal.data ? modal.data : null;
    setError("");
    try {
      const saved = fd ? await updateFornecedor(fd, values) : await createFornecedor(values);
      setFornecedores(prev => fd
        ? prev.map(fornecedor => fornecedor.id === saved.id ? saved : fornecedor)
        : [...prev, saved]);
      setModal(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o fornecedor.");
      throw requestError;
    }
  };
  const saveFuncionario = async (values: Omit<FuncionarioModalFormValues, "confirmSenha">) => {
    const fn = modal?.type === "funcionario" && modal.data ? modal.data : null;
    setError("");
    try {
      const saved = fn ? await updateFuncionario(fn, values) : await createFuncionario(values);
      setFuncionarios(prev => fn
        ? prev.map(funcionario => funcionario.id === saved.id ? saved : funcionario)
        : [...prev, saved]);
      setModal(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o funcionário.");
      throw requestError;
    }
  };
  const {
    clientesByStatus,
    filtClientes,
    filtFornecedores,
    filtFuncionarios
  } = selectPeople({
    clientes,
    fornecedores,
    funcionarios,
    statusFiltro
  });
  const openNew = () => {
    if (aba === "clientes") setModal({
      type: "cliente"
    });else if (aba === "fornecedores") setModal({
      type: "fornecedor"
    });else setModal({
      type: "funcionario"
    });
  };
  const newLabel = aba === "clientes" ? "Novo cliente" : aba === "fornecedores" ? "Novo fornecedor" : "Novo funcionário";
  const requestSupplierDeletion = (target: Fornecedor) => setDeleteTarget({
    nome: target.razaoSocial,
    fn: async () => {
      setError("");
      try {
        const deletedId = await removeFornecedor(target);
        setFornecedores(prev => prev.filter(fornecedor => fornecedor.id !== deletedId));
        setDeleteTarget(null);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir o fornecedor.");
        throw requestError;
      }
    }
  });
  const requestClientDeletion = (target: Cliente) => setDeleteTarget({
    nome: target.nome,
    fn: async () => {
      setError("");
      try {
        const deletedId = await removeCliente(target);
        setClientes(prev => prev.filter(cliente => cliente.id !== deletedId));
        setDeleteTarget(null);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir o cliente.");
        throw requestError;
      }
    }
  });
  const requestEmployeeDeletion = (target: Funcionario) => setDeleteTarget({
    nome: target.nome,
    fn: async () => {
      setError("");
      try {
        const deletedId = await removeFuncionario(target);
        setFuncionarios(prev => prev.filter(funcionario => funcionario.id !== deletedId));
        setDeleteTarget(null);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir o funcionário.");
        throw requestError;
      }
    }
  });
  return {
    clientes,
    setClientes,
    fornecedores,
    funcionarios,
    setFuncionarios,
    currentUser,
    isLoading,
    error,
    isAdmin,
    aba,
    setAba,
    selectTab,
    search,
    setSearch,
    submitSearch,
    statusFiltro,
    setStatusFiltro,
    modal,
    setModal,
    deleteTarget,
    setDeleteTarget,
    inativarTarget,
    setInativarTarget,
    clientesAtivos,
    clientesInativos,
    allTabs,
    tabs,
    saveCliente,
    saveFornecedor,
    saveFuncionario,
    clientesByStatus,
    filtClientes,
    filtFornecedores,
    filtFuncionarios,
    openNew,
    newLabel,
    requestClientDeletion,
    requestSupplierDeletion,
    requestEmployeeDeletion
  };
}
