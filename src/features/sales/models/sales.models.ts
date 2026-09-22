



export interface CatalogItem {
  id: number;
  nome: string;
  preco: number;
  tipo: "produto" | "decant";
  volume?: string;
  productContextId?: number;
}

export interface CartItem {
  catalogItem: CatalogItem;
  quantidade: number;
}

export interface NovoClienteModalFormValues {
  nome: string;
  telefone: string;
}

export interface SalesFormValues {
  pagamento: string;
  isOnline: boolean;
  canalOnline: "whatsapp" | "site" | null;
  frete: string;
  tipoDesconto: "percentual" | "valor";
  desconto: string;
}
