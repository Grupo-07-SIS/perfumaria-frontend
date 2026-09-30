export interface CatalogItem {
  id: number;
  nome: string;
  preco: number;
  tipo: "produto";
  estoqueAtual: number;
}
export interface CartItem {
  catalogItem: CatalogItem;
  quantidade: number;
}
export interface NovoClienteModalFormValues {
  nome: string;
  telefone: string;
  email: string;
}
export interface SaleCustomer extends NovoClienteModalFormValues {
  id: number;
}
export interface SalesFormValues {
  pagamento: string;
  isOnline: boolean;
  canalOnline: "whatsapp" | "site" | null;
  frete: string;
  tipoDesconto: "percentual" | "valor";
  desconto: string;
}
