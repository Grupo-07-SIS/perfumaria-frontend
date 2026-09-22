


export type StatusFilter = "todos" | "finalizado" | "cancelado";

export interface EditModalFormValues {
  pagamento: string;
  novoStatus: "Pendente" | "Finalizado" | "Cancelado";
}
