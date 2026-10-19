import { selectOnlineOrders } from "../services/online-orders.service";
import { onlineOrdersRepository, triggerBotpressOnlineFlow } from "../repository/online-orders.repository";
import { useEffect, useState } from "react";
import type { Venda } from "../../../core/store/AppContext";
import { useApp } from "../../../core/store/AppContext";
export function useOnlineOrdersFacade() {
  const { currentUser } = useApp();
  const canManageOrders = currentUser?.cargo === "Administrador";
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let isActive = true;
    onlineOrdersRepository.listOnlineOrders().then(orders => {
      if (isActive) setVendas(orders);
    }).catch(() => {
      if (isActive) setError("Não foi possível carregar os pedidos online.");
    }).finally(() => {
      if (isActive) setIsLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, []);
  const applyStatus = async (venda: Venda, status: "PENDENTE" | "FINALIZADA" | "CANCELADA", codigoRastreio?: string) => {
    setError("");
    if (!canManageOrders && status !== "FINALIZADA") {
      setError("Você não tem permissão para desfazer ou cancelar pedidos.");
      return false;
    }
    try {
      if (status !== "FINALIZADA" && venda.canalOnline === "whatsapp") {
        await onlineOrdersRepository.deleteTrackingCode(venda.id);
        setVendas(current => current.map(order => order.id === venda.id ? { ...order, codigoRastreio: undefined } : order));
      }
      const saved = await onlineOrdersRepository.updateStatus(venda.id, status, codigoRastreio);
      setVendas(current => current.map(v => v.id === saved.id ? saved : v));
      return true;
    } catch {
      setError("Não foi possível atualizar o pedido.");
      return false;
    }
  };
  const pedidosOnline = vendas.filter(v => v.tipoVenda === "online" && !v.cancelada);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "pendente" | "finalizado">("pendente");
  const [filtroCanal, setFiltroCanal] = useState<"todos" | "whatsapp" | "site">("todos");
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const openOrderDetails = (venda: Venda | null) => {
    if (!venda) {
      setViewVenda(null);
      return;
    }
    setViewVenda(venda);
    onlineOrdersRepository.getOrder(venda.id).then(setViewVenda).catch(() => setError("Não foi possível carregar os detalhes do pedido."));
  };
  const [cancelVenda, setCancelVenda] = useState<Venda | null>(null);
  const [rastreioVenda, setRastreioVenda] = useState<Venda | null>(null);
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
      await applyStatus(venda, "PENDENTE");
    } else if (venda.canalOnline === "whatsapp") {
      setRastreioVenda(venda);
    } else {
      if (!(await applyStatus(venda, "FINALIZADA"))) return;
      try {
        await triggerOnlineFinalizationFlow(venda);
      } catch (error) {
        console.error("Erro ao acionar fluxo de venda online no Botpress", error);
      }
    }
  };
  const confirmarRastreio = async (codigo: string) => {
    if (!rastreioVenda) return;
    const venda = rastreioVenda;
    if (!(await applyStatus(venda, "FINALIZADA", codigo || undefined))) return;
    try {
      await triggerOnlineFinalizationFlow(rastreioVenda, codigo || undefined);
    } catch (error) {
      console.error("Erro ao acionar fluxo de venda online no Botpress", error);
    }
    setRastreioVenda(null);
  };
  const confirmarCancelamento = async () => {
    if (!cancelVenda) return;
    if (await applyStatus(cancelVenda, "CANCELADA")) setCancelVenda(null);
  };
  const {
    pendentes,
    finalizados,
    filtered
  } = selectOnlineOrders({
    pedidosOnline,
    search,
    filtroStatus,
    filtroCanal
  });
  return {
    canManageOrders,
    vendas,
    isLoading,
    error,
    pedidosOnline,
    search,
    setSearch,
    filtroStatus,
    setFiltroStatus,
    filtroCanal,
    setFiltroCanal,
    viewVenda,
    setViewVenda: openOrderDetails,
    cancelVenda,
    setCancelVenda,
    rastreioVenda,
    setRastreioVenda,
    triggerOnlineFinalizationFlow,
    handleFinalizar,
    confirmarRastreio,
    confirmarCancelamento,
    pendentes,
    finalizados,
    filtered
  };
}
