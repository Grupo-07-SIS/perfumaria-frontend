import type { CargoFuncionario, Endereco, Fornecedor } from "../../../core/store/AppContext";

export type { CargoFuncionario, Endereco, Fornecedor };
export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: Endereco;
  totalPedidos: number;
  ativo?: boolean;
}
export interface Funcionario {
  id: string;
  nome: string;
  cargo: CargoFuncionario;
  email: string;
  senha?: string;
}
export type Aba = "clientes" | "fornecedores" | "funcionarios";
export type StatusFiltro = "todos" | "ativos" | "inativos";
export interface PeopleListParams {
  busca?: string;
  status?: number;
}
export interface EnderecoFieldsProps {
  endereco: Endereco;
  onChange: (e: Endereco) => void;
  errors: Record<string, string>;
  onClearError: (key: string) => void;
}
export interface ClienteModalProps {
  data?: Cliente;
  onClose: () => void;
  onSave: (d: ClienteModalFormValues) => void | Promise<void>;
}
export interface FornecedorModalProps {
  data?: Fornecedor;
  onClose: () => void;
  onSave: (d: FornecedorModalFormValues) => void | Promise<void>;
}
export interface FuncionarioModalProps {
  data?: Funcionario;
  onClose: () => void;
  onSave: (d: Omit<FuncionarioModalFormValues, "confirmSenha">) => void | Promise<void>;
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
