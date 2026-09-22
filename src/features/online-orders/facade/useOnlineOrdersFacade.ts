import { selectOnlineOrders } from "../services/online-orders.service";
import { useOnlineOrdersRepository } from "../repository/online-orders.repository";
import { useState } from "react";
import type { Venda } from "../../../core/store/AppContext";
import { triggerBotpressOnlineFlow } from "../repository/online-orders.repository";

export function useOnlineOrdersFacade() {
const {
    vendas,
    updateVendaEnvio,
    updateVenda
  } = useOnlineOrdersRepository();
const pedidosOnline = vendas.filter(v => v.tipoVenda === "online" && !v.cancelada);
const [search, setSearch] = useState("");
const [filtroStatus, setFiltroStatus] = useState<"todos" | "pendente" | "finalizado">("pendente");
const [filtroCanal, setFiltroCanal] = useState<"todos" | "whatsapp" | "site">("todos");
const [viewVenda, setViewVenda] = useState<Venda | null>(null);
const [cancelVenda, setCancelVenda] = useState<Venda | null>(null);
const [rastreioVenda, setRastreioVenda] = useState<Venda | null>(null);
const hoje = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };
const triggerOnlineFinalizationFlow = async (venda: Venda, codigoRastreio?: string) => {
    if (!venda.canalOnline) return;
    const desconto = venda.desconto ?? 0;
    const frete = venda.frete ?? 0;
    const subtotal = venda.total - frete + desconto;
    await triggerBotpressOnlineFlow({
      codigoVenda: venda.id,
      nomeCliente: venda.cliente,
      emailCliente: venda.emailCliente || undefined,
      dadosPedido: venda.itens.map(item => ({
        ...item,
        totalItem: item.valorUnitario * item.quantidade
      })),
      frete: venda.frete,
      desconto: desconto > 0 ? desconto : undefined,
      subtotal,
      totalVenda: venda.total,
      formaPagamento: venda.pagamento,
      dataHoraPedido: venda.data,
      canalVenda: venda.canalOnline,
      codigoRastreio: venda.canalOnline === "whatsapp" ? codigoRastreio : undefined
    });
  };
const handleFinalizar = async (venda: Venda) => {
    if (venda.enviado) {
      // desfazer
      updateVendaEnvio(venda.id, false);
    } else if (venda.canalOnline === "whatsapp") {
      setRastreioVenda(venda);
    } else {
      updateVendaEnvio(venda.id, true, hoje());
      try {
        await triggerOnlineFinalizationFlow(venda);
      } catch (error) {
        console.error("Erro ao acionar fluxo de venda online no Botpress", error);
      }
    }
  };
const confirmarRastreio = async (codigo: string) => {
    if (!rastreioVenda) return;
    updateVendaEnvio(rastreioVenda.id, true, hoje(), codigo || undefined);
    try {
      await triggerOnlineFinalizationFlow(rastreioVenda, codigo || undefined);
    } catch (error) {
      console.error("Erro ao acionar fluxo de venda online no Botpress", error);
    }
    setRastreioVenda(null);
  };
const confirmarCancelamento = () => {
    if (!cancelVenda) return;
    updateVenda({
      ...cancelVenda,
      cancelada: true,
      enviado: false
    });
    setCancelVenda(null);
  };
const { pendentes, finalizados, filtered } = selectOnlineOrders({ pedidosOnline, search, filtroStatus, filtroCanal });
return { vendas, updateVendaEnvio, updateVenda, pedidosOnline, search, setSearch, filtroStatus, setFiltroStatus, filtroCanal, setFiltroCanal, viewVenda, setViewVenda, cancelVenda, setCancelVenda, rastreioVenda, setRastreioVenda, hoje, triggerOnlineFinalizationFlow, handleFinalizar, confirmarRastreio, confirmarCancelamento, pendentes, finalizados, filtered };
}
