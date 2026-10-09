import type { Cliente, ClienteModalFormValues, Endereco, Fornecedor, FornecedorModalFormValues, Funcionario, FuncionarioModalFormValues, PeopleListParams, StatusFiltro } from "../models/people.models";
import { onlyDigits } from "../../../shared/utils/digits";
import axios from "axios";

const CNPJ_DIGITS = 14;
const CEP_DIGITS = 8;
const TELEFONE_DIGITS = [10, 11];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function peopleErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  const technicalError = message.match(/^([A-Z][A-Z0-9_]*):(\d{3}|unknown)(?:\|(.+))?$/);
  const response = axios.isAxiosError(error) ? error.response : undefined;
  const status = response?.status ?? (technicalError?.[2] && technicalError[2] !== "unknown" ? Number(technicalError[2]) : undefined);
  const operation = technicalError?.[1] ?? "";
  const responseMessage = (response?.data as { message?: unknown } | undefined)?.message;
  const detail = typeof responseMessage === "string" ? responseMessage : technicalError?.[3];

  if (status === 409 && (operation.includes("EMPLOYEES") || /e-?mail.*(cadastrad|exist)|email.*(cadastrad|exist)/i.test(detail ?? ""))) {
    return "Este e-mail já está cadastrado. Informe outro e-mail.";
  }
  if ((status === 400 || status === 422) && detail) return detail;
  if (status === 400 || status === 422) return "Confira os dados informados e corrija os campos destacados.";
  if (status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
  if (status === 403) return "Você não tem permissão para realizar esta operação.";
  if (status === 404) return "O registro não foi encontrado. Atualize a lista e tente novamente.";
  if (status === 409) return "Já existe um cadastro com esses dados. Confira as informações e tente novamente.";
  if (status !== undefined && status >= 500) return "O servidor está temporariamente indisponível. Tente novamente em instantes.";
  if (axios.isAxiosError(error) && !error.response) return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  if (detail && !/exception|error|failed|\b\d{3}\b/i.test(detail)) return detail;
  if (message && !technicalError) return message;
  return fallback;
}

function validateOptionalTelefone(telefone: string) {
  const digits = onlyDigits(telefone);
  return digits && !TELEFONE_DIGITS.includes(digits.length) ? "Informe DDD + número (10 ou 11 dígitos)." : undefined;
}

function validateOptionalCep(cep = "") {
  const digits = onlyDigits(cep);
  return digits && digits.length !== CEP_DIGITS ? "O CEP deve conter 8 dígitos." : undefined;
}

function validateOptionalEmail(email = "") {
  const trimmed = email.trim();
  return trimmed && !EMAIL_PATTERN.test(trimmed) ? "Informe um e-mail válido." : undefined;
}

export function buildSearchParams(busca: string): PeopleListParams {
  return busca ? { busca } : {};
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
  email,
  endereco
}: Pick<ClienteModalFormValues, "nome" | "telefone"> & Partial<Pick<ClienteModalFormValues, "email" | "endereco">>) {
  const errors: Record<string, string> = {};
  if (!nome.trim()) errors.nome = "Obrigatório.";
  const telefoneError = telefone.trim() ? validateOptionalTelefone(telefone) : "Obrigatório.";
  if (telefoneError) errors.telefone = telefoneError;
  const emailError = validateOptionalEmail(email);
  if (emailError) errors.email = emailError;
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
  else {
    const emailError = validateOptionalEmail(email);
    if (emailError) errors.email = emailError;
  }
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
