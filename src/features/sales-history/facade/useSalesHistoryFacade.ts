import { saleUpdateErrorMessage } from "../services/sales-history.service";
import { salesHistoryRepository, useSalesHistoryRepository } from "../repository/sales-history.repository";
import { useEffect, useState } from "react";
import type { SalesHistorySummary, StatusFilter, TipoFilter } from "../models/sales-history.models";
import type { Venda } from "../../../core/store/AppContext";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { SALES_HISTORY_PAGE_SIZE } from "../config/sales-history.config";

const LIST_ERROR = "Não foi possível carregar o histórico de vendas.";
const SUMMARY_ERROR = "Não foi possível carregar o resumo do histórico de vendas.";
const EMPTY_SUMMARY: SalesHistorySummary = { totalVendas: 0, finalizadas: 0, canceladas: 0, faturamento: 0 };

export function useSalesHistoryFacade() {
  const { currentUser } = useSalesHistoryRepository();
  const [paginatedSales, setPaginatedSales] = useState<Venda[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<SalesHistorySummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = currentUser?.cargo === "Administrador";
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [pagamentoFilter, setPagamentoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  // The page is tied to the search it was chosen for, so a new search starts on page 1 without an extra request.
  const [pageState, setPageState] = useState({ page: 1, search: "" });
  const currentPage = pageState.search === debouncedSearch ? pageState.page : 1;
  const [reloadKey, setReloadKey] = useState(0);
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const [editVenda, setEditVenda] = useState<Venda | null>(null);

  const setCurrentPage = (page: number) => {
    if (Number.isInteger(page)) setPageState({ page: Math.max(1, Math.min(page, totalPages)), search: debouncedSearch });
  };
  const resetPage = () => setPageState({ page: 1, search: debouncedSearch });

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    salesHistoryRepository.listSales({
      page: currentPage,
      size: SALES_HISTORY_PAGE_SIZE,
      search: debouncedSearch,
      pagamento: pagamentoFilter,
      tipo: tipoFilter,
      status: statusFilter,
    })
      .then((result) => {
        if (!isActive) return;
        setPaginatedSales(result.items);
        setTotalItems(result.totalItems);
        setTotalPages(result.totalPages);
        setError((current) => current === LIST_ERROR ? "" : current);
        if (currentPage > result.totalPages) setPageState({ page: result.totalPages, search: debouncedSearch });
      })
      .catch(() => {
        if (isActive) setError(LIST_ERROR);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, pagamentoFilter, tipoFilter, statusFilter, reloadKey]);

  useEffect(() => {
    let isActive = true;
    salesHistoryRepository.getSummary()
      .then((loaded) => {
        if (!isActive) return;
        setSummary(loaded);
        setError((current) => current === SUMMARY_ERROR ? "" : current);
      })
      .catch(() => {
        if (isActive) setError((current) => current || SUMMARY_ERROR);
      });

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

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

  const firstSaleOnPage = totalItems === 0 || paginatedSales.length === 0 ? 0 : (currentPage - 1) * SALES_HISTORY_PAGE_SIZE + 1;
  const lastSaleOnPage = firstSaleOnPage === 0 ? 0 : firstSaleOnPage + paginatedSales.length - 1;

  const updatePaymentFilter = (value: string) => {
    setPagamentoFilter(value);
    resetPage();
  };
  const updateTypeFilter = (value: TipoFilter) => {
    setTipoFilter(value);
    resetPage();
  };
  const updateStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    resetPage();
  };
  const handleSaveEdit = async (updated: Venda) => {
    setError("");
    const reactivating = !!editVenda?.cancelada && !updated.cancelada;
    try {
      const savedSale = await salesHistoryRepository.updateSale(updated);
      setPaginatedSales((current) => current.map((sale) => sale.id === savedSale.id ? { ...sale, ...savedSale } : sale));
      setEditVenda(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setError(saleUpdateErrorMessage(error, reactivating));
    }
  };
  return {
    currentUser,
    isAdmin,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    paginatedSales,
    firstSaleOnPage,
    lastSaleOnPage,
    search,
    setSearch,
    pagamentoFilter,
    setPagamentoFilter: updatePaymentFilter,
    tipoFilter,
    setTipoFilter: updateTypeFilter,
    statusFilter,
    setStatusFilter: updateStatusFilter,
    viewVenda,
    setViewVenda: openSaleDetails,
    editVenda,
    setEditVenda: (sale: Venda | null) => {
      setError("");
      setEditVenda(sale);
    },
    totalVendas: summary.totalVendas,
    totalFinalizadas: summary.finalizadas,
    totalCanceladas: summary.canceladas,
    totalFaturamento: summary.faturamento,
    handleSaveEdit
  };
}
