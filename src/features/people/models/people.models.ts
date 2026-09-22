import { CargoFuncionario } from "../../../core/store/AppContext";


import { Endereco } from "../../../core/store/AppContext";
import { Cliente } from "../../../core/store/AppContext";
import { Fornecedor } from "../../../core/store/AppContext";
import { Funcionario } from "../../../core/store/AppContext";

export type Aba = "clientes" | "fornecedores" | "funcionarios";

export type StatusFiltro = "todos" | "ativos" | "inativos";

export interface EnderecoFieldsProps {
  endereco: Endereco;
  onChange: (e: Endereco) => void;
  errors: Record<string, string>;
  onClearError: (key: string) => void;
}

export interface ClienteModalProps {
  data?: Cliente;
  onClose: () => void;
  onSave: (d: Omit<Cliente, "id" | "totalPedidos" | "ativo">) => void;
}

export interface FornecedorModalProps {
  data?: Fornecedor;
  onClose: () => void;
  onSave: (d: Omit<Fornecedor, "id" | "totalCompras">) => void;
}

export interface FuncionarioModalProps {
  data?: Funcionario;
  onClose: () => void;
  onSave: (d: Omit<Funcionario, "id">) => void;
}

export interface ClienteModalFormValues {
  nome: string;
  telefone: string;
  email: string;
  endereco: Endereco;
}

export interface FornecedorModalFormValues {
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: Endereco;
}

export interface FuncionarioModalFormValues {
  nome: string;
  cargo: CargoFuncionario;
  email: string;
  senha: string;
  confirmSenha: string;
}
