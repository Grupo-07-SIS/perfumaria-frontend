import { selectSalesHistory } from "../services/sales-history.service";
import { useSalesHistoryRepository } from "../repository/sales-history.repository";
import { useState } from "react";
import type { StatusFilter } from "../models/sales-history.models";
import type { Venda } from "../../../core/store/AppContext";
export function useSalesHistoryFacade() {
  const {
    vendas,
    updateVenda,
    currentUser
  } = useSalesHistoryRepository();
  const isAdmin = currentUser?.cargo === "Administrador";
  const [search, setSearch] = useState("");
  const [pagamentoFilter, setPagamentoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState<"todos" | "online" | "presencial">("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const [editVenda, setEditVenda] = useState<Venda | null>(null);
  const {
    vendasExibidas,
    finalizadas,
    canceladas,
    totalFaturamento,
    filtered
  } = selectSalesHistory({
    vendas,
    search,
    pagamentoFilter,
    tipoFilter,
    statusFilter
  });
  const handleSaveEdit = (updated: Venda) => {
    updateVenda(updated);
    setEditVenda(null);
  };
  return {
    vendas,
    updateVenda,
    currentUser,
    isAdmin,
    search,
    setSearch,
    pagamentoFilter,
    setPagamentoFilter,
    tipoFilter,
    setTipoFilter,
    statusFilter,
    setStatusFilter,
    viewVenda,
    setViewVenda,
    editVenda,
    setEditVenda,
    vendasExibidas,
    finalizadas,
    canceladas,
    totalFaturamento,
    filtered,
    handleSaveEdit
  };
}
