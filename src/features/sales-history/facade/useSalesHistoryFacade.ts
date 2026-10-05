import { selectSalesHistory } from "../services/sales-history.service";
import { salesHistoryRepository, useSalesHistoryRepository } from "../repository/sales-history.repository";
import { useEffect, useState } from "react";
import type { StatusFilter } from "../models/sales-history.models";
import type { Venda } from "../../../core/store/AppContext";
import { SALES_HISTORY_PAGE_SIZE } from "../config/sales-history.config";
export function useSalesHistoryFacade() {
  const { currentUser } = useSalesHistoryRepository();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = currentUser?.cargo === "Administrador";
  const [search, setSearch] = useState("");
  const [pagamentoFilter, setPagamentoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState<"todos" | "online" | "presencial">("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const [editVenda, setEditVenda] = useState<Venda | null>(null);

  useEffect(() => {
    let isActive = true;
    salesHistoryRepository.listSales()
      .then((sales) => {
        if (isActive) setVendas(sales);
      })
      .catch(() => {
        if (isActive) setError("Não foi possível carregar o histórico de vendas.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const openSaleDetails = (sale: Venda | null) => {
    if (!sale) {
      setViewVenda(null);
      return;
    }

    setViewVenda(sale);
    salesHistoryRepository.getSaleDetails(sale.id)
      .then(setViewVenda)
      .catch(() => setError("Não foi possível carregar os detalhes da venda."));
  };
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
  const totalPages = Math.max(1, Math.ceil(filtered.length / SALES_HISTORY_PAGE_SIZE));
  const firstSaleOnPage = filtered.length === 0 ? 0 : (currentPage - 1) * SALES_HISTORY_PAGE_SIZE + 1;
  const lastSaleOnPage = Math.min(currentPage * SALES_HISTORY_PAGE_SIZE, filtered.length);
  const paginatedSales = filtered.slice(firstSaleOnPage - 1, lastSaleOnPage);

  const updateSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const updatePaymentFilter = (value: string) => {
    setPagamentoFilter(value);
    setCurrentPage(1);
  };
  const updateTypeFilter = (value: "todos" | "online" | "presencial") => {
    setTipoFilter(value);
    setCurrentPage(1);
  };
  const updateStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const handleSaveEdit = async (updated: Venda) => {
    setError("");
    try {
      const savedSale = await salesHistoryRepository.updateSale(updated);
      setVendas((current) => current.map((sale) => sale.id === savedSale.id ? { ...sale, ...savedSale } : sale));
      setEditVenda(null);
    } catch {
      setError("Não foi possível atualizar a venda.");
    }
  };
  return {
    vendas,
    currentUser,
    isAdmin,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedSales,
    firstSaleOnPage,
    lastSaleOnPage,
    search,
    setSearch: updateSearch,
    pagamentoFilter,
    setPagamentoFilter: updatePaymentFilter,
    tipoFilter,
    setTipoFilter: updateTypeFilter,
    statusFilter,
    setStatusFilter: updateStatusFilter,
    viewVenda,
    setViewVenda: openSaleDetails,
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
