import type { FuncionarioModalFormValues } from "../models/people.models";
import type { FornecedorModalFormValues } from "../models/people.models";
import type { ClienteModalFormValues } from "../models/people.models";
import type { Cliente, Fornecedor, Funcionario } from "../../../core/store/AppContext";
import type { StatusFiltro } from "../models/people.models";
import { Endereco } from "../../../core/store/AppContext";

export function formatEndereco(e: Endereco) {
  const parts = [e.logradouro, e.numero ? `nº ${e.numero}` : "", e.complemento, e.bairro, e.cidade && e.uf ? `${e.cidade}/${e.uf}` : e.cidade || e.uf, e.cep ? `CEP ${e.cep}` : ""].filter(Boolean);
  return parts.join(", ") || "—";
}

export function selectPeople({ clientes, fornecedores, funcionarios, statusFiltro, search }: { clientes: Cliente[]; fornecedores: Fornecedor[]; funcionarios: Funcionario[]; statusFiltro: StatusFiltro; search: string }) {
const clientesByStatus = clientes.filter(c => {
    if (statusFiltro === "ativos") return c.ativo !== false;
    if (statusFiltro === "inativos") return c.ativo === false;
    return true;
  });
const filtClientes = clientesByStatus.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()) || c.telefone.includes(search));
const filtFornecedores = fornecedores.filter(f => f.razaoSocial.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase()));
const filtFuncionarios = funcionarios.filter(f => f.nome.toLowerCase().includes(search.toLowerCase()) || f.cargo.toLowerCase().includes(search.toLowerCase()));
return { clientesByStatus, filtClientes, filtFornecedores, filtFuncionarios };
}

export function validateCliente({ nome, telefone }: Pick<ClienteModalFormValues, "nome" | "telefone">) {
const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = "Obrigatório.";
    if (!telefone.trim()) errors.telefone = "Obrigatório.";
return errors;
}

export function validateFornecedor({ razaoSocial, cnpj, email }: Pick<FornecedorModalFormValues, "razaoSocial" | "cnpj" | "email">) {
const errors: Record<string, string> = {};
    if (!razaoSocial.trim()) errors.razaoSocial = "Obrigatório.";
    if (!cnpj.trim()) errors.cnpj = "Obrigatório.";
    if (!email.trim()) errors.email = "Obrigatório.";
return errors;
}

export function validateFuncionario({ nome, email, senha, confirmSenha, isNew }: Pick<FuncionarioModalFormValues, "nome" | "email" | "senha" | "confirmSenha"> & { isNew: boolean }) {
const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = "Obrigatório.";
    if (!email.trim()) errors.email = "Obrigatório.";
    if (isNew && !senha) errors.senha = "Defina uma senha de acesso.";
    if (senha && senha.length < 6) errors.senha = "Mínimo de 6 caracteres.";
    if (senha && senha !== confirmSenha) errors.confirmSenha = "As senhas não coincidem.";
return errors;
}
