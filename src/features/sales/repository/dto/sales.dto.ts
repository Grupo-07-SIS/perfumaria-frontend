export interface SaleRequestDto {
  clienteId: number;
  forma: string;
  desconto: number;
  tipoDesconto: "VALOR" | "PERCENTUAL";
  tipoVenda: "PRESENCIAL" | "ONLINE";
  canalVendaOnline?: "WHATSAPP" | "SITE";
  frete?: number;
  itens: { produtoId: number; quantidade: number }[];
}

export interface SaleProductDto {
  id: number;
  nome: string;
  precoVenda: number;
  estoqueAtual: number;
  status: number;
}

export interface SaleProductsPageDto {
  content: SaleProductDto[];
  totalPages: number;
}

export interface SaleCustomerDto {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: number;
}

export interface SaleCustomerRequestDto {
  nome: string;
  telefone: string;
  email: string;
}

export interface SaleCustomersPageDto {
  content: SaleCustomerDto[];
  totalPages: number;
}