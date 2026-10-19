import type { StatusFilter } from "../models/sales-history.models";
import type { Venda } from "../../../core/store/AppContext";
import axios from "axios";

export function saleUpdateErrorMessage(error: unknown, reactivating: boolean): string {
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    const message = (error.response.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string" && /estoque insuficiente/i.test(message)) {
      return reactivating
        ? "Não foi possível reativar a venda: um ou mais produtos estão sem estoque ou com quantidade insuficiente. A venda permanece cancelada."
        : "Não foi possível atualizar a venda: estoque insuficiente para os produtos selecionados.";
    }
  }
  return "Não foi possível atualizar a venda.";
}

export function getVendaStatus(v: Venda): "Pendente" | "Finalizado" | "Cancelado" {
  if (v.cancelada) return "Cancelado";
  if (v.tipoVenda === "presencial" || v.enviado) return "Finalizado";
  return "Pendente";
}
export function selectSalesHistory({
  vendas,
  search,
  pagamentoFilter,
  tipoFilter,
  statusFilter
}: {
  vendas: Venda[];
  search: string;
  pagamentoFilter: string;
  tipoFilter: "todos" | "online" | "presencial";
  statusFilter: StatusFilter;
}) {
  const vendasExibidas = vendas.filter(v => getVendaStatus(v) !== "Pendente");
  const finalizadas = vendasExibidas.filter(v => getVendaStatus(v) === "Finalizado");
  const canceladas = vendasExibidas.filter(v => getVendaStatus(v) === "Cancelado");
  const totalFaturamento = finalizadas.reduce((acc, v) => acc + v.total, 0);
  const filtered = vendasExibidas.filter(v => {
    const st = getVendaStatus(v);
    if (statusFilter === "finalizado" && st !== "Finalizado") return false;
    if (statusFilter === "cancelado" && st !== "Cancelado") return false;
    const matchSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
    const matchPag = pagamentoFilter === "todos" || v.pagamento === pagamentoFilter;
    const matchTipo = tipoFilter === "todos" || v.tipoVenda === tipoFilter;
    return matchSearch && matchPag && matchTipo;
  });
  return {
    vendasExibidas,
    finalizadas,
    canceladas,
    totalFaturamento,
    filtered
  };
}
