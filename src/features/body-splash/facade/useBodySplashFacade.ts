import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import type { BodySplashItem, BodySplashModalFormValues, BodySplashProductOption } from "../models/body-splash.models";
import { createBodySplash, fetchBodySplashCatalog, removeBodySplash, updateBodySplash } from "../services/body-splash.service";

export function useBodySplashFacade() {
  const [items, setItems] = useState<BodySplashItem[]>([]);
  const [productOptions, setProductOptions] = useState<BodySplashProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<BodySplashItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<BodySplashItem | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const requestId = useRef(0);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    fetchBodySplashCatalog()
      .then(catalog => {
        if (currentRequestId !== requestId.current) return;
        setItems(catalog.page.content);
        setProductOptions(catalog.productOptions);
      })
      .catch(() => setError("Não foi possível carregar os preços de Body Splash."))
      .finally(() => {
        if (currentRequestId === requestId.current) setIsLoading(false);
      });
  }, []);

  const searchBy = async (busca: string) => {
    const currentRequestId = ++requestId.current;
    setSubmittedSearch(busca);
    setIsLoading(true);
    setError("");
    try {
      const catalog = await fetchBodySplashCatalog({ busca, page: 0, size: 10 });
      if (currentRequestId !== requestId.current) return;
      setItems(catalog.page.content);
      setProductOptions(catalog.productOptions);
    } catch {
      if (currentRequestId !== requestId.current) return;
      setError("Não foi possível carregar os preços de Body Splash.");
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  };

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
        setItems(prev => [...prev, saved]);
      }
      setEditItem(null);
      setShowModal(false);
    } catch (requestError) {
      setError("Não foi possível salvar o Body Splash.");
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
      setDeleteItem(null);
    } catch {
      setError("Não foi possível excluir o Body Splash.");
    }
  };
  return {
    items,
    productOptions,
    isLoading,
    error,
    showModal,
    setShowModal,
    editItem,
    setEditItem,
    deleteItem,
    setDeleteItem,
    search,
    setSearch,
    submitSearch,
    filtered,
    handleSave,
    fmt,
    confirmDelete
  };
}
