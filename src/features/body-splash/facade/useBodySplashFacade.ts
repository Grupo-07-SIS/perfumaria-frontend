import { useEffect, useRef, useState } from "react";
import { useApp } from "../../../core/store/AppContext";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { DEFAULT_PAGE_SIZE } from "../../../shared/hooks/usePagination";
import type { BodySplashCategoryOption, BodySplashItem, BodySplashModalFormValues, BodySplashNewProductForm, BodySplashProductOption } from "../models/body-splash.models";
import { createBodySplash, createBodySplashStockItem, fetchBodySplashCatalog, fetchBodySplashCategories, removeBodySplash, updateBodySplash } from "../services/body-splash.service";

export function useBodySplashFacade() {
  const { currentUser } = useApp();
  const [items, setItems] = useState<BodySplashItem[]>([]);
  const [productOptions, setProductOptions] = useState<BodySplashProductOption[]>([]);
  const [categories, setCategories] = useState<BodySplashCategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editItem, setEditItem] = useState<BodySplashItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<BodySplashItem | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const requestId = useRef(0);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    let isMounted = true;
    fetchBodySplashCategories()
      .then(result => {
        if (isMounted) setCategories(result);
      })
      .catch(() => {
        if (isMounted) setError("Não foi possível carregar as famílias olfativas.");
      });
    const currentRequestId = ++requestId.current;
    fetchBodySplashCatalog()
      .then(catalog => {
        if (currentRequestId !== requestId.current) return;
        setItems(catalog.page.content);
        setCurrentPageState(1);
        setTotalElements(catalog.page.totalElements);
        setTotalPages(Math.max(1, catalog.page.totalPages));
        setProductOptions(catalog.productOptions);
        setError(catalog.productOptionsError ?? "");
      })
      .catch(() => {
        if (currentRequestId === requestId.current) setError("Não foi possível carregar os preços de Body Splash.");
      })
      .finally(() => {
        if (currentRequestId === requestId.current) setIsLoading(false);
      });
    return () => {
      isMounted = false;
      requestId.current += 1;
    };
  }, []);

  const loadPage = async (page: number, busca: string) => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError("");
    try {
      const catalog = await fetchBodySplashCatalog({ busca, page: page - 1, size: DEFAULT_PAGE_SIZE });
      if (currentRequestId !== requestId.current) return;
      setItems(catalog.page.content);
      setCurrentPageState(page);
      setTotalElements(catalog.page.totalElements);
      setTotalPages(Math.max(1, catalog.page.totalPages));
      setProductOptions(catalog.productOptions);
      setError(catalog.productOptionsError ?? "");
    } catch {
      if (currentRequestId !== requestId.current) return;
      setError("Não foi possível carregar os preços de Body Splash.");
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  };

  const searchBy = async (busca: string) => {
    setSubmittedSearch(busca);
    await loadPage(1, busca);
  };
  const setCurrentPage = (page: number) => loadPage(page, submittedSearch);

  const submitSearch = () => searchBy(search.trim());

  useEffect(() => {
    if (debouncedSearch === submittedSearch) return;
    void searchBy(debouncedSearch);
  }, [debouncedSearch]);

  const filtered = items;

  const handleSave = async (values: BodySplashModalFormValues) => {
    setError("");
    try {
      if (editItem) {
        const saved = await updateBodySplash(editItem, values);
        setItems(prev => prev.map(item => item.id === saved.id ? saved : item));
      } else {
        const saved = await createBodySplash(values);
        setItems(prev => [...prev, saved].slice(0, DEFAULT_PAGE_SIZE));
        setTotalElements(totalElements + 1);
        setTotalPages(Math.max(1, Math.ceil((totalElements + 1) / DEFAULT_PAGE_SIZE)));
        if (totalElements >= DEFAULT_PAGE_SIZE || submittedSearch) await loadPage(1, submittedSearch);
      }
      setEditItem(null);
      setShowModal(false);
    } catch (requestError) {
      setError("Não foi possível salvar o Body Splash.");
      throw requestError;
    }
  };
  const handleCreateProduct = async (values: BodySplashNewProductForm) => {
    setError("");
    try {
      await createBodySplashStockItem(values);
      const catalog = await fetchBodySplashCatalog({ page: currentPage - 1, size: DEFAULT_PAGE_SIZE });
      setProductOptions(catalog.productOptions);
      setError(catalog.productOptionsError ?? "");
      setShowProductModal(false);
    } catch (requestError) {
      setError("Não foi possível cadastrar o Body Splash no estoque.");
      throw requestError;
    }
  };
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const confirmDelete = async () => {
    if (!deleteItem) return;
    setError("");
    try {
      const deletedId = await removeBodySplash(deleteItem);
      setItems(prev => prev.filter(item => item.id !== deletedId));
      const remaining = Math.max(0, totalElements - 1);
      const remainingPages = Math.max(1, Math.ceil(remaining / DEFAULT_PAGE_SIZE));
      setTotalElements(remaining);
      setTotalPages(remainingPages);
      if (totalElements > DEFAULT_PAGE_SIZE || submittedSearch) await loadPage(Math.min(currentPage, remainingPages), submittedSearch);
      setDeleteItem(null);
    } catch {
      setError("Não foi possível excluir o Body Splash.");
    }
  };
  return {
    canManagePrices: currentUser?.cargo === "Administrador",
    items,
    productOptions,
    categories,
    isLoading,
    error,
    showModal,
    setShowModal,
    showProductModal,
    setShowProductModal,
    editItem,
    setEditItem,
    deleteItem,
    setDeleteItem,
    search,
    setSearch,
    submitSearch,
    filtered,
    currentPage,
    setCurrentPage,
    totalElements,
    totalPages,
    firstItem: filtered.length === 0 ? 0 : (currentPage - 1) * DEFAULT_PAGE_SIZE + 1,
    lastItem: Math.min((currentPage - 1) * DEFAULT_PAGE_SIZE + filtered.length, totalElements),
    handleSave,
    handleCreateProduct,
    fmt,
    confirmDelete
  };
}
