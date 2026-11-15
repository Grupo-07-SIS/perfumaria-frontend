import { selectOnlineOrders } from "../services/online-orders.service";
import { onlineOrdersRepository } from "../repository/online-orders.repository";
import { useEffect, useRef, useState } from "react";
import type { Venda } from "../../../core/store/AppContext";
import { useApp } from "../../../core/store/AppContext";
import { usePagination } from "../../../shared/hooks/usePagination";
export function useOnlineOrdersFacade() {
  const { currentUser } = useApp();
  const canManageOrders = currentUser?.cargo === "Administrador";
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const detailsRequestId = useRef(0);
  const updatingRef = useRef(false);
  const [isUpdating, setIsUpdating] = useState(false);
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
      detailsRequestId.current += 1;
    };
  }, []);
  const applyStatus = async (venda: Venda, status: "PENDENTE" | "FINALIZADA" | "CANCELADA", codigoRastreio?: string) => {
    if (updatingRef.current) return false;
    setError("");
    if (!canManageOrders && status !== "FINALIZADA") {
      setError("Você não tem permissão para desfazer ou cancelar pedidos.");
      return false;
    }
    updatingRef.current = true;
    setIsUpdating(true);
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
    } finally {
      updatingRef.current = false;
      setIsUpdating(false);
    }
  };
  const pedidosOnline = vendas.filter(v => v.tipoVenda === "online" && !v.cancelada);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "pendente" | "finalizado">("pendente");
  const [filtroCanal, setFiltroCanal] = useState<"todos" | "whatsapp" | "site">("todos");
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const openOrderDetails = (venda: Venda | null) => {
    const requestId = ++detailsRequestId.current;
    if (!venda) {
      setViewVenda(null);
      return;
    }
    setViewVenda(venda);
    onlineOrdersRepository.getOrder(venda.id).then(details => {
      if (requestId === detailsRequestId.current) setViewVenda(details);
    }).catch(() => {
      if (requestId === detailsRequestId.current) setError("Não foi possível carregar os detalhes do pedido.");
    });
  };
  const [cancelVenda, setCancelVenda] = useState<Venda | null>(null);
  const [rastreioVenda, setRastreioVenda] = useState<Venda | null>(null);
  const handleFinalizar = async (venda: Venda) => {
    if (updatingRef.current) return;
    if (venda.enviado) {
      await applyStatus(venda, "PENDENTE");
    } else if (venda.canalOnline === "whatsapp") {
      setRastreioVenda(venda);
    } else {
      await applyStatus(venda, "FINALIZADA");
    }
  };
  const confirmarRastreio = async (codigo: string) => {
    if (!rastreioVenda) return;
    const venda = rastreioVenda;
    if (!(await applyStatus(venda, "FINALIZADA", codigo || undefined))) return;
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
  const pagination = usePagination(filtered);
  return {
    canManageOrders,
    vendas,
    isLoading,
    isUpdating,
    error,
    pedidosOnline,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      pagination.setCurrentPage(1);
    },
    filtroStatus,
    setFiltroStatus: (value: "todos" | "pendente" | "finalizado") => {
      setFiltroStatus(value);
      pagination.setCurrentPage(1);
    },
    filtroCanal,
    setFiltroCanal: (value: "todos" | "whatsapp" | "site") => {
      setFiltroCanal(value);
      pagination.setCurrentPage(1);
    },
    viewVenda,
    setViewVenda: openOrderDetails,
    cancelVenda,
    setCancelVenda,
    rastreioVenda,
    setRastreioVenda,
    handleFinalizar,
    confirmarRastreio,
    confirmarCancelamento,
    pendentes,
    finalizados,
    filtered,
    pagination,
    paginatedOrders: pagination.paginatedItems,
  };
}
