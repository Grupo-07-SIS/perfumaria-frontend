export type StatusFilter = "todos" | "finalizado" | "cancelado";
export interface EditModalFormValues {
  pagamento: string;
  codigoRastreio: string;
  novoStatus: "Pendente" | "Finalizado" | "Cancelado";
}
