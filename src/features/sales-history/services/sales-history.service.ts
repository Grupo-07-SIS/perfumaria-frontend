import type { StatusFilter } from "../models/sales-history.models";
import type { Venda } from "../../../core/store/AppContext";

export function getVendaStatus(v: Venda): "Pendente" | "Finalizado" | "Cancelado" {
  if (v.cancelada) return "Cancelado";
  if (v.tipoVenda === "presencial" || v.enviado) return "Finalizado";
  return "Pendente";
}

export function selectSalesHistory({ vendas, search, pagamentoFilter, tipoFilter, statusFilter }: { vendas: Venda[]; search: string; pagamentoFilter: string; tipoFilter: "todos" | "online" | "presencial"; statusFilter: StatusFilter }) {
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
return { vendasExibidas, finalizadas, canceladas, totalFaturamento, filtered };
}
