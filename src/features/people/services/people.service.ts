import type { Cliente, ClienteModalFormValues, Endereco, Fornecedor, FornecedorModalFormValues, Funcionario, FuncionarioModalFormValues, PeopleListParams, StatusFiltro } from "../models/people.models";
import { onlyDigits } from "../../../shared/utils/digits";

const CNPJ_DIGITS = 14;
const CEP_DIGITS = 8;
const TELEFONE_DIGITS = [10, 11];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateOptionalTelefone(telefone: string) {
  const digits = onlyDigits(telefone);
  return digits && !TELEFONE_DIGITS.includes(digits.length) ? "Informe DDD + número (10 ou 11 dígitos)." : undefined;
}

function validateOptionalCep(cep = "") {
  const digits = onlyDigits(cep);
  return digits && digits.length !== CEP_DIGITS ? "O CEP deve conter 8 dígitos." : undefined;
}

const CLIENTE_STATUS_PARAM: Record<StatusFiltro, number | undefined> = {
  ativos: 1,
  inativos: 0,
  todos: undefined,
};

export function buildSearchParams(busca: string): PeopleListParams {
  return busca ? { busca } : {};
}

export function buildClienteSearchParams(busca: string, statusFiltro: StatusFiltro): PeopleListParams {
  const status = CLIENTE_STATUS_PARAM[statusFiltro];
  return status === undefined ? buildSearchParams(busca) : { ...buildSearchParams(busca), status };
}

export function formatEndereco(e: Endereco) {
  const parts = [e.logradouro, e.numero ? `nº ${e.numero}` : "", e.complemento, e.bairro, e.cidade && e.uf ? `${e.cidade}/${e.uf}` : e.cidade || e.uf, e.cep ? `CEP ${e.cep}` : ""].filter(Boolean);
  return parts.join(", ") || "—";
}
export function selectPeople({
  clientes,
  fornecedores,
  funcionarios,
  statusFiltro
}: {
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  funcionarios: Funcionario[];
  statusFiltro: StatusFiltro;
}) {
  const clientesByStatus = clientes.filter(c => {
    if (statusFiltro === "ativos") return c.ativo !== false;
    if (statusFiltro === "inativos") return c.ativo === false;
    return true;
  });
  return {
    clientesByStatus,
    filtClientes: clientesByStatus,
    filtFornecedores: fornecedores,
    filtFuncionarios: funcionarios
  };
}
export function validateCliente({
  nome,
  telefone,
  endereco
}: Pick<ClienteModalFormValues, "nome" | "telefone"> & Partial<Pick<ClienteModalFormValues, "endereco">>) {
  const errors: Record<string, string> = {};
  if (!nome.trim()) errors.nome = "Obrigatório.";
  if (!telefone.trim()) errors.telefone = "Obrigatório.";
  const cepError = validateOptionalCep(endereco?.cep);
  if (cepError) errors.cep = cepError;
  return errors;
}
export function validateFornecedor({
  razaoSocial,
  cnpj,
  email,
  telefone = "",
  endereco
}: Pick<FornecedorModalFormValues, "razaoSocial" | "cnpj" | "email"> & Partial<Pick<FornecedorModalFormValues, "telefone" | "endereco">>) {
  const errors: Record<string, string> = {};
  if (!razaoSocial.trim()) errors.razaoSocial = "Obrigatório.";
  if (!cnpj.trim()) errors.cnpj = "Obrigatório.";
  else if (onlyDigits(cnpj).length !== CNPJ_DIGITS) errors.cnpj = "O CNPJ deve conter 14 dígitos.";
  if (!email.trim()) errors.email = "Obrigatório.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Informe um e-mail válido.";
  const telefoneError = validateOptionalTelefone(telefone);
  if (telefoneError) errors.telefone = telefoneError;
  const cepError = validateOptionalCep(endereco?.cep);
  if (cepError) errors.cep = cepError;
  return errors;
}
export function validateFuncionario({
  nome,
  email,
  senha,
  confirmSenha,
  isNew
}: Pick<FuncionarioModalFormValues, "nome" | "email" | "senha" | "confirmSenha"> & {
  isNew: boolean;
}) {
  const errors: Record<string, string> = {};
  if (!nome.trim()) errors.nome = "Obrigatório.";
  if (!email.trim()) errors.email = "Obrigatório.";
  if (isNew && !senha) errors.senha = "Defina uma senha de acesso.";
  if (senha && senha.length < 6) errors.senha = "Mínimo de 6 caracteres.";
  if (senha && senha !== confirmSenha) errors.confirmSenha = "As senhas não coincidem.";
  return errors;
}
