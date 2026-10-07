import { selectOnlineOrders } from "../services/online-orders.service";
import { onlineOrdersRepository, triggerBotpressOnlineFlow } from "../repository/online-orders.repository";
import { useEffect, useState } from "react";
import type { Venda } from "../../../core/store/AppContext";
export function useOnlineOrdersFacade() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // O backend não guarda data de envio nem rastreio; ficam apenas nesta sessão.
  const [envios, setEnvios] = useState<Record<string, {
    dataEnvio?: string;
    codigoRastreio?: string;
  }>>({});
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
  const applyStatus = async (venda: Venda, status: "PENDENTE" | "FINALIZADA" | "CANCELADA") => {
    setError("");
    try {
      const saved = await onlineOrdersRepository.updateStatus(venda.id, status);
      setVendas(current => current.map(v => v.id === saved.id ? saved : v));
      return true;
    } catch {
      setError("Não foi possível atualizar o pedido.");
      return false;
    }
  };
  const pedidosOnline = vendas.filter(v => v.tipoVenda === "online" && !v.cancelada).map(v => ({
    ...v,
    ...(v.enviado ? envios[v.id] : undefined)
  }));
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
    onlineOrdersRepository.getOrder(venda.id).then(detail => setViewVenda({
      ...detail,
      ...(detail.enviado ? envios[detail.id] : undefined)
    })).catch(() => setError("Não foi possível carregar os detalhes do pedido."));
  };
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
      if (await applyStatus(venda, "PENDENTE")) {
        setEnvios(({
          [venda.id]: _removed,
          ...rest
        }) => rest);
      }
    } else if (venda.canalOnline === "whatsapp") {
      setRastreioVenda(venda);
    } else {
      if (!(await applyStatus(venda, "FINALIZADA"))) return;
      setEnvios(current => ({
        ...current,
        [venda.id]: {
          dataEnvio: hoje()
        }
      }));
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
    if (!(await applyStatus(venda, "FINALIZADA"))) return;
    setEnvios(current => ({
      ...current,
      [venda.id]: {
        dataEnvio: hoje(),
        codigoRastreio: codigo || undefined
      }
    }));
    try {
      await triggerOnlineFinalizationFlow(rastreioVenda, codigo || undefined);
    } catch (error) {
      console.error("Erro ao acionar fluxo de venda online no Botpress", error);
    }
    setRastreioVenda(null);
  };
  const confirmarCancelamento = async () => {
    if (!cancelVenda) return;
    await applyStatus(cancelVenda, "CANCELADA");
    setCancelVenda(null);
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
    hoje,
    triggerOnlineFinalizationFlow,
    handleFinalizar,
    confirmarRastreio,
    confirmarCancelamento,
    pendentes,
    finalizados,
    filtered
  };
}
