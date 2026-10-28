export type StatusFilter = "todos" | "finalizado" | "cancelado";
export type TipoFilter = "todos" | "online" | "presencial";
export interface EditModalFormValues {
  pagamento: string;
  codigoRastreio: string;
  novoStatus: "Pendente" | "Finalizado" | "Cancelado";
}
export interface SalesHistoryQuery {
  /** 1-based page number */
  page: number;
  size: number;
  search: string;
  pagamento: string;
  tipo: TipoFilter;
  status: StatusFilter;
}
export interface SalesHistorySummary {
  totalVendas: number;
  finalizadas: number;
  canceladas: number;
  faturamento: number;
}
