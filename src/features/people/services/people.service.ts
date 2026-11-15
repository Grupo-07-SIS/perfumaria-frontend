import type { Cliente, ClienteModalFormValues, Endereco, Fornecedor, FornecedorModalFormValues, Funcionario, FuncionarioModalFormValues, PeopleListParams, StatusFiltro } from "../models/people.models";
import { onlyDigits } from "../../../shared/utils/digits";
import axios from "axios";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "../../../shared/utils/password";

const CNPJ_DIGITS = 14;
const CEP_DIGITS = 8;
const TELEFONE_DIGITS = [10, 11];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CUSTOMER_NAME_MAX_LENGTH = 45;
const CUSTOMER_EMAIL_MAX_LENGTH = 100;
const SUPPLIER_NAME_MAX_LENGTH = 45;
const SUPPLIER_EMAIL_MAX_LENGTH = 45;
const EMPLOYEE_NAME_MAX_LENGTH = 45;
const EMPLOYEE_EMAIL_MAX_LENGTH = 45;
const ADDRESS_TEXT_MAX_LENGTH = 45;

export function peopleErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  const technicalError = message.match(/^([A-Z][A-Z0-9_]*):(\d{3}|unknown)(?:\|(.+))?$/);
  const response = axios.isAxiosError(error) ? error.response : undefined;
  const status = response?.status ?? (technicalError?.[2] && technicalError[2] !== "unknown" ? Number(technicalError[2]) : undefined);
  const operation = technicalError?.[1] ?? "";
  const responseMessage = (response?.data as { message?: unknown } | undefined)?.message;
  const detail = typeof responseMessage === "string" ? responseMessage : technicalError?.[3];

  if (status === 409 && /^(?:este )?telefone\b.*cadastrad/i.test(detail ?? "")) {
    return "Este telefone já está cadastrado. Informe outro telefone.";
  }
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

export function peopleFormErrors(error: unknown, fallback: string, aliases: Record<string, string> = {}): Record<string, string> {
  const response = axios.isAxiosError(error) ? error.response : undefined;
  const metadata = error && typeof error === "object" ? error as { status?: number; fields?: unknown } : undefined;
  const status = response?.status ?? metadata?.status;
  const fields = response?.data?.fields ?? metadata?.fields;
  const allowedFields = ["nome", "email", "telefone", "senha", "cnpj", "endereco.cep", "endereco.logradouro", "endereco.numero", "endereco.complemento", "endereco.bairro", "endereco.cidade", "endereco.uf"];
  if ([400, 409, 422].includes(status ?? 0) && fields && typeof fields === "object") {
    const errors = Object.fromEntries(Object.entries(fields)
      .filter(([key, value]) => allowedFields.includes(key) && typeof value === "string")
      .map(([key, value]) => [aliases[key] ?? key.replace(/^endereco\./, ""), value as string]));
    if (Object.keys(errors).length) return errors;
  }
  const message = peopleErrorMessage(error, fallback);
  if (message.startsWith("Este e-mail já está cadastrado")) return { email: message };
  if (message.startsWith("Este telefone já está cadastrado")) return { telefone: message };
  return { form: message };
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

function validateAddressText(endereco?: Partial<Endereco>) {
  const errors: Record<string, string> = {};
  const fields = ["logradouro", "numero", "complemento", "bairro", "cidade"] as const;
  fields.forEach((field) => {
    if ((endereco?.[field]?.length ?? 0) > ADDRESS_TEXT_MAX_LENGTH) {
      errors[field] = `Máximo de ${ADDRESS_TEXT_MAX_LENGTH} caracteres.`;
    }
  });
  return errors;
}

export function buildSearchParams(busca: string): PeopleListParams {
  return busca ? { busca } : {};
}

export function formatEndereco(endereco?: Partial<Endereco> | null) {
  if (!endereco) return "—";
  const parts = [endereco.logradouro, endereco.numero ? `nº ${endereco.numero}` : "", endereco.complemento, endereco.bairro, endereco.cidade && endereco.uf ? `${endereco.cidade}/${endereco.uf}` : endereco.cidade || endereco.uf, endereco.cep ? `CEP ${endereco.cep}` : ""].filter(Boolean);
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
  else if (nome.trim().length > CUSTOMER_NAME_MAX_LENGTH) errors.nome = `Máximo de ${CUSTOMER_NAME_MAX_LENGTH} caracteres.`;
  const telefoneError = telefone.trim() ? validateOptionalTelefone(telefone) : "Obrigatório.";
  if (telefoneError) errors.telefone = telefoneError;
  const trimmedEmail = email?.trim() ?? "";
  if (!trimmedEmail) errors.email = "Informe o e-mail do cliente.";
  else if (trimmedEmail.length > CUSTOMER_EMAIL_MAX_LENGTH) errors.email = `Máximo de ${CUSTOMER_EMAIL_MAX_LENGTH} caracteres.`;
  else {
    const emailError = validateOptionalEmail(trimmedEmail);
    if (emailError) errors.email = emailError;
  }
  const cepError = validateOptionalCep(endereco?.cep);
  if (cepError) errors.cep = cepError;
  Object.assign(errors, validateAddressText(endereco));
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
  else if (razaoSocial.trim().length > SUPPLIER_NAME_MAX_LENGTH) errors.razaoSocial = `Máximo de ${SUPPLIER_NAME_MAX_LENGTH} caracteres.`;
  if (!cnpj.trim()) errors.cnpj = "Obrigatório.";
  else if (onlyDigits(cnpj).length !== CNPJ_DIGITS) errors.cnpj = "O CNPJ deve conter 14 dígitos.";
  if (!email.trim()) errors.email = "Obrigatório.";
  else if (email.trim().length > SUPPLIER_EMAIL_MAX_LENGTH) errors.email = `Máximo de ${SUPPLIER_EMAIL_MAX_LENGTH} caracteres.`;
  else {
    const emailError = validateOptionalEmail(email);
    if (emailError) errors.email = emailError;
  }
  const telefoneError = validateOptionalTelefone(telefone);
  if (telefoneError) errors.telefone = telefoneError;
  const cepError = validateOptionalCep(endereco?.cep);
  if (cepError) errors.cep = cepError;
  Object.assign(errors, validateAddressText(endereco));
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
  else if (nome.trim().length > EMPLOYEE_NAME_MAX_LENGTH) errors.nome = `Máximo de ${EMPLOYEE_NAME_MAX_LENGTH} caracteres.`;
  if (!email.trim()) errors.email = "Obrigatório.";
  else if (email.trim().length > EMPLOYEE_EMAIL_MAX_LENGTH) errors.email = `Máximo de ${EMPLOYEE_EMAIL_MAX_LENGTH} caracteres.`;
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Informe um e-mail válido.";
  if (isNew && !senha) errors.senha = "Defina uma senha de acesso.";
  if (senha && !isStrongPassword(senha)) errors.senha = STRONG_PASSWORD_MESSAGE;
  if (senha && senha !== confirmSenha) errors.confirmSenha = "As senhas não coincidem.";
  return errors;
}
