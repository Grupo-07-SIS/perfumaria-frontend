export type OnlineOrderStatus = "PENDENTE" | "FINALIZADA" | "CANCELADA";

export interface OnlineOrderItemDto {
  produtoNome: string;
  quantidade: number;
  tipoItem?: "PRODUTO" | "DECANT" | "BODY_SPLASH_FRACIONADO" | null;
  valorUnitario: number;
  volumeMl?: number | null;
}

export interface OnlineOrderDto {
  canalVendaOnline?: "WHATSAPP" | "SITE" | null;
  clienteNome?: string | null;
  dataHora?: string | null;
  dataVenda?: string | null;
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
