import axios from "axios";
import type { NovoClienteModalFormValues, CartItem, CatalogItem, SalesFormValues, SaleCustomer } from "../models/sales.models";
import { pagamentos } from "../config/sales.config";
import { salesRepository } from "../repository/sales.repository";
import { toSaleCustomer, toSaleProduct, toSaleRequest } from "../repository/mapper/sales.mapper";

function parseDecimal(value: string): number {
  return Number(value.trim().replace(",", "."));
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSaleTotals({
  cart,
  isOnline,
  frete,
  tipoDesconto,
  desconto
}: Pick<SalesFormValues, "tipoDesconto" | "desconto" | "isOnline" | "frete"> & {
  cart: CartItem[];
}) {
  const subtotal = roundCurrency(cart.reduce((sum, item) => sum + item.catalogItem.preco * item.quantidade, 0));
  const parsedDiscount = parseDecimal(desconto);
  const descontoNum = Number.isFinite(parsedDiscount) ? Math.max(0, parsedDiscount) : 0;
  const descontoValor = tipoDesconto === "percentual" ? subtotal * descontoNum / 100 : descontoNum;
  const descontoAplicado = roundCurrency(Math.min(descontoValor, subtotal));
  const parsedFreight = isOnline ? parseDecimal(frete) : 0;
  const freteVal = Number.isFinite(parsedFreight) ? roundCurrency(Math.max(0, parsedFreight)) : 0;
  const total = roundCurrency(Math.max(0, subtotal - descontoAplicado) + freteVal);
  return {
    subtotal,
    freteVal,
    descontoNum,
    descontoValor,
    descontoAplicado,
    total
  };
}
export function validateNovoCliente({
  nome,
  telefone,
  email
}: NovoClienteModalFormValues) {
  const errors: Record<string, string> = {};
  if (!nome.trim()) errors.nome = "Obrigatório.";
  else if (nome.trim().length > 45) errors.nome = "Máximo de 45 caracteres.";
  if (!/^\d{10,11}$/.test(telefone.replace(/\D/g, ""))) errors.telefone = "Informe um telefone com DDD (10 ou 11 dígitos).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 100) errors.email = "Informe um e-mail válido (máximo de 100 caracteres).";
  return errors;
}

export async function fetchSalesData() {
  const [products, customers] = await Promise.all([salesRepository.listProducts(), salesRepository.listCustomers()]);
  return {
    products: products.filter((product) => product.status === 1).map(dto => toSaleProduct(dto, { id: dto.id, nome: dto.nome, preco: dto.precoVenda, tipo: "produto" })),
    customers: customers.filter((customer) => customer.status === 1).map(toSaleCustomer),
  };
}

export async function searchSaleItems(nome: string, products: CatalogItem[] = []) {
  const items = await salesRepository.searchSaleItems(nome);
  return items.filter(item => item.status == null || item.status === 1)
    .map(dto => toSaleProduct(dto, products.find(product => product.id === dto.id)));
}

export function validateSale(cart: CartItem[], customer: SaleCustomer | null, form: SalesFormValues): string[] {
  const errors: string[] = [];
  if (cart.length === 0) errors.push("Adicione pelo menos um item ao carrinho.");
  if (!customer || !Number.isSafeInteger(customer.id) || customer.id <= 0) errors.push("Selecione um cliente. O vínculo com cliente é obrigatório.");
  if (!pagamentos.includes(form.pagamento)) errors.push("Selecione o tipo de pagamento.");
  if (form.isOnline && form.canalOnline !== "whatsapp" && form.canalOnline !== "site") errors.push("Selecione o canal da venda online (WhatsApp ou Site).");
  const freight = form.isOnline ? parseDecimal(form.frete) : 0;
  if (!Number.isFinite(freight) || freight < 0) errors.push("Informe um frete válido, maior ou igual a zero.");
  const discount = parseDecimal(form.desconto);
  if (!Number.isFinite(discount) || discount < 0 || (form.tipoDesconto === "percentual" && discount > 100)) errors.push("Informe um desconto válido (percentual entre 0 e 100).");
  const quantities = new Map<number, number>();
  for (const { catalogItem, quantidade } of cart) {
    const quantity = (quantities.get(catalogItem.id) ?? 0) + quantidade;
    quantities.set(catalogItem.id, quantity);
    if (!Number.isSafeInteger(catalogItem.id) || catalogItem.id <= 0 || !Number.isFinite(catalogItem.preco) || catalogItem.preco < 0) errors.push("Selecione um produto válido do catálogo.");
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantity > 2147483647) errors.push("Informe uma quantidade inteira válida.");
    if (catalogItem.estoqueAtual !== undefined && (!Number.isInteger(catalogItem.estoqueAtual) || quantity > catalogItem.estoqueAtual)) errors.push(`Estoque insuficiente para ${catalogItem.nome}.`);
  }
  return errors;
}

export async function registerSale(cart: CartItem[], customer: SaleCustomer | null, form: SalesFormValues): Promise<void> {
  const errors = validateSale(cart, customer, form);
  if (errors.length || !customer) throw new Error(errors.join(" "));
  const totals = calculateSaleTotals({ cart, ...form });
  const discount = form.tipoDesconto === "percentual" ? parseDecimal(form.desconto) : totals.descontoAplicado;
  await salesRepository.createSale(toSaleRequest(cart, customer, form, discount, totals.freteVal));
}

export async function createSaleCustomer(values: NovoClienteModalFormValues): Promise<SaleCustomer> {
  const errors = validateNovoCliente(values);
  if (Object.keys(errors).length) throw new Error(Object.values(errors).join(" "));
  const dto = await salesRepository.createCustomer({ nome: values.nome.trim(), telefone: values.telefone.replace(/\D/g, ""), email: values.email.trim() });
  return toSaleCustomer(dto);
}

export function salesErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  const messages: Record<number, string> = {
    400: "Dados inválidos. Confira o cliente, os itens e os valores informados.",
    401: "Sessão expirada. Entre novamente.",
    403: "Você não tem permissão para realizar esta operação.",
    404: "Cliente ou produto não encontrado. Atualize os dados.",
    409: "Conflito no cadastro. Verifique os dados e tente novamente.",
  };
  return messages[error.response?.status ?? 0] ?? fallback;
}
