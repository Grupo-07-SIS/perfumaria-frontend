export type OnlineOrderStatus = "PENDENTE" | "FINALIZADA" | "CANCELADA";

export interface OnlineOrderItemDto {
  produtoNome: string;
  categoriaNome?: string | null;
  quantidade: number;
  tipoItem?: "PRODUTO" | "DECANT" | "BODY_SPLASH_FRACIONADO" | null;
  valorUnitario: number;
  volumeMl?: number | null;
}

export interface OnlineOrderDto {
  canalVendaOnline?: "WHATSAPP" | "SITE" | null;
  clienteNome?: string | null;
  codigoRastreio?: string | null;
  dataHoraVenda: string;
  desconto?: number | null;
  forma?: string | null;
  frete?: number | null;
  id: number;
  itens?: OnlineOrderItemDto[] | null;
  status: OnlineOrderStatus;
  subtotal?: number | null;
  tipoVenda: "PRESENCIAL" | "ONLINE";
  valorFinal?: number | null;
  valorTotal?: number | null;
}
