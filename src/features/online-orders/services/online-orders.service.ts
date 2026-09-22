import type { Venda } from "../../../core/store/AppContext";
export function selectOnlineOrders({
  pedidosOnline,
  search,
  filtroStatus,
  filtroCanal
}: {
  pedidosOnline: Venda[];
  search: string;
  filtroStatus: "todos" | "pendente" | "finalizado";
  filtroCanal: "todos" | "whatsapp" | "site";
}) {
  const pendentes = pedidosOnline.filter(p => !p.enviado).length;
  const finalizados = pedidosOnline.filter(p => p.enviado).length;
  const filtered = pedidosOnline.filter(p => {
    const matchSearch = p.cliente.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === "todos" || filtroStatus === "pendente" && !p.enviado || filtroStatus === "finalizado" && p.enviado;
    const matchCanal = filtroCanal === "todos" || p.canalOnline === filtroCanal;
    return matchSearch && matchStatus && matchCanal;
  });
  return {
    pendentes,
    finalizados,
    filtered
  };
}
