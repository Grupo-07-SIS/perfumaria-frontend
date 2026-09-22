import { selectPeople } from "../services/people.service";
import { usePeopleRepository } from "../repository/people.repository";
import { useState } from "react";
import type { Aba, StatusFiltro } from "../models/people.models";
import { Cliente } from "../../../core/store/AppContext";
import { Fornecedor } from "../../../core/store/AppContext";
import { Funcionario } from "../../../core/store/AppContext";
import { User } from "lucide-react";
import { Truck } from "lucide-react";
import { Briefcase } from "lucide-react";

export function usePeopleFacade() {
const {
    clientes,
    setClientes,
    fornecedores,
    setFornecedores,
    funcionarios,
    setFuncionarios,
    currentUser
  } = usePeopleRepository();
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
    fn: () => void;
  } | null>(null);
const [inativarTarget, setInativarTarget] = useState<Cliente | null>(null);
const clientesAtivos = clientes.filter(c => c.ativo !== false);
const clientesInativos = clientes.filter(c => c.ativo === false);
const allTabs: {
    key: Aba;
    label: string;
    icon: React.ReactNode;
    count: number;
    adminOnly: boolean;
  }[] = [{
    key: "clientes",
    label: "Clientes",
    icon: <User size={15} />,
    count: clientesAtivos.length,
    adminOnly: false
  }, {
    key: "fornecedores",
    label: "Fornecedores",
    icon: <Truck size={15} />,
    count: fornecedores.length,
    adminOnly: true
  }, {
    key: "funcionarios",
    label: "Funcionários",
    icon: <Briefcase size={15} />,
    count: funcionarios.length,
    adminOnly: true
  }];
const tabs = allTabs.filter(t => isAdmin || !t.adminOnly);
const saveCliente = (d: Omit<Cliente, "id" | "totalPedidos" | "ativo">) => {
    const cd = modal?.type === "cliente" && modal.data ? modal.data : null;
    if (cd) setClientes(prev => prev.map(c => c.id === cd.id ? {
      ...c,
      ...d
    } : c));else {
      const newId = Math.max(...clientes.map(c => c.id), 0) + 1;
      setClientes(prev => [...prev, {
        id: newId,
        ...d,
        totalPedidos: 0,
        ativo: true
      }]);
    }
    setModal(null);
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
const saveFuncionario = (d: Omit<Funcionario, "id">) => {
    const fn = modal?.type === "funcionario" && modal.data ? modal.data : null;
    if (fn) setFuncionarios(prev => prev.map(f => f.id === fn.id ? {
      ...f,
      ...d
    } : f));else {
      const newId = Math.max(...funcionarios.map(f => f.id), 0) + 1;
      setFuncionarios(prev => [...prev, {
        id: newId,
        ...d
      }]);
    }
    setModal(null);
  };
const toggleAtivo = (id: number, ativar: boolean) => {
    setClientes(prev => prev.map(c => c.id === id ? {
      ...c,
      ativo: ativar
    } : c));
  };
const { clientesByStatus, filtClientes, filtFornecedores, filtFuncionarios } = selectPeople({ clientes, fornecedores, funcionarios, statusFiltro, search });
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
return { clientes, setClientes, fornecedores, setFornecedores, funcionarios, setFuncionarios, currentUser, isAdmin, aba, setAba, search, setSearch, statusFiltro, setStatusFiltro, modal, setModal, deleteTarget, setDeleteTarget, inativarTarget, setInativarTarget, clientesAtivos, clientesInativos, allTabs, tabs, saveCliente, saveFornecedor, saveFuncionario, toggleAtivo, clientesByStatus, filtClientes, filtFornecedores, filtFuncionarios, openNew, newLabel };
}
