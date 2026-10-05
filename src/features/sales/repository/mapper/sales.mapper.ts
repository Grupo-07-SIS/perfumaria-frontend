import type { CartItem, CatalogItem, SaleCustomer, SalesFormValues } from "../../models/sales.models";
import type { SaleCustomerDto, SaleProductDto, SaleRequestDto } from "../dto/sales.dto";

export function toSaleProduct(dto: SaleProductDto, baseProduct?: CatalogItem): CatalogItem {
  const namedVolume = dto.nome.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*ml$/i)?.[1];
  const volume = dto.volume != null && dto.volume > 0 ? String(dto.volume) : namedVolume;
  const tipo: CatalogItem["tipo"] = baseProduct ? "produto"
    : namedVolume && /^decant\s/i.test(dto.nome) ? "decant"
    : namedVolume && /^body\s+splash\s/i.test(dto.nome) ? "body-splash-fracionado"
    : "produto";
  const categoriaNome = dto.categoriaNome ?? baseProduct?.categoriaNome;
  const categoria = categoriaNome?.trim().toLocaleLowerCase("pt-BR");
  const apresentacao = tipo !== "produto" ? "Fracionado"
    : categoria === "perfume" ? "Perfume completo"
    : categoria === "body splash" ? "Body Splash completo"
    : undefined;
  return {
    id: dto.id,
    nome: dto.nome,
    nomeExibicao: namedVolume ? dto.nome.replace(/\s+\d+(?:[.,]\d+)?\s*ml$/i, "").trim() : undefined,
    categoriaNome,
    apresentacao,
    volumetria: volume ? `${volume}ml` : undefined,
    preco: dto.precoVenda,
    estoqueAtual: dto.estoqueAtual ?? baseProduct?.estoqueAtual,
    tipo,
  };
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