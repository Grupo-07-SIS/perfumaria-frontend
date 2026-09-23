import { createPeopleTabs } from "../config/people.presentation";
import { selectPeople } from "../services/people.service";
import { usePeopleRepository } from "../repository/people.repository";
import { useEffect, useState } from "react";
import type { Aba, Cliente, ClienteModalFormValues, Fornecedor, Funcionario, FuncionarioModalFormValues, StatusFiltro } from "../models/people.models";
import { createCliente, fetchClientes, removeCliente, updateCliente } from "../services/clientes.service";
import { createFuncionario, fetchFuncionarios, removeFuncionario, updateFuncionario } from "../services/funcionarios.service";

export function usePeopleFacade() {
  const {
    fornecedores,
    setFornecedores,
    currentUser
  } = usePeopleRepository();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = currentUser?.cargo === "Administrador";
  const [aba, setAba] = useState<Aba>("clientes");
  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("ativos");
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
  useEffect(() => {
    Promise.all([fetchClientes(), fetchFuncionarios()])
      .then(([loadedClientes, loadedFuncionarios]) => {
        setClientes(loadedClientes);
        setFuncionarios(loadedFuncionarios);
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar pessoas."))
      .finally(() => setIsLoading(false));
  }, []);

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
  const saveFornecedor = (d: Omit<Fornecedor, "id" | "totalCompras">) => {
    const fd = modal?.type === "fornecedor" && modal.data ? modal.data : null;
    if (fd) setFornecedores(prev => prev.map(f => f.id === fd.id ? {
      ...f,
      ...d
    } : f));else {
      const newId = Math.max(...fornecedores.map(f => f.id), 0) + 1;
      setFornecedores(prev => [...prev, {
        id: newId,
        ...d,
        totalCompras: 0
      }]);
    }
    setModal(null);
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
    statusFiltro,
    search
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
    fn: () => setFornecedores(prev => prev.filter(x => x.id !== target.id))
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
    setFornecedores,
    funcionarios,
    setFuncionarios,
    currentUser,
    isLoading,
    error,
    isAdmin,
    aba,
    setAba,
    search,
    setSearch,
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
