import type { CartItem, CatalogItem, SaleCustomer, SalesFormValues } from "../../models/sales.models";
import type { SaleCustomerDto, SaleProductDto, SaleRequestDto } from "../dto/sales.dto";

export function toSaleProduct(dto: SaleProductDto): CatalogItem {
  return { id: dto.id, nome: dto.nome, preco: dto.precoVenda, estoqueAtual: dto.estoqueAtual, tipo: "produto" };
}

export function toSaleCustomer(dto: SaleCustomerDto): SaleCustomer {
  return { id: dto.id, nome: dto.nome, telefone: dto.telefone ?? "", email: dto.email ?? "" };
}

export function toSaleRequest(cart: CartItem[], customer: SaleCustomer, form: SalesFormValues, discount: number, freight: number): SaleRequestDto {
  return {
    clienteId: customer.id,
    forma: form.pagamento,
    desconto: discount,
    tipoDesconto: form.tipoDesconto === "percentual" ? "PERCENTUAL" : "VALOR",
    tipoVenda: form.isOnline ? "ONLINE" : "PRESENCIAL",
    ...(form.isOnline ? { canalVendaOnline: form.canalOnline === "whatsapp" ? "WHATSAPP" as const : "SITE" as const, frete: freight } : {}),
    itens: cart.map(({ catalogItem, quantidade }) => ({ produtoId: catalogItem.id, quantidade })),
  };
}