import { useEffect, useRef, useState } from "react";
import { useApp } from "../../../core/store/AppContext";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { DEFAULT_PAGE_SIZE as PAGE_SIZE } from "../../../shared/hooks/usePagination";
import type { Decant, DecantModalFormValues, PerfumeOption } from "../models/decants.models";
import { createDecant, fetchDecants, fetchPerfumeOptions, removeDecant, updateDecant } from "../services/decants.service";

export function useDecantsFacade() {
  const { currentUser } = useApp();
  const [decants, setDecants] = useState<Decant[]>([]);
  const [perfumeOptions, setPerfumeOptions] = useState<PerfumeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editDecant, setEditDecant] = useState<Decant | null>(null);
  const [deleteDecant, setDeleteDecant] = useState<Decant | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [currentPage, setCurrentPageState] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const requestId = useRef(0);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    Promise.allSettled([
      fetchDecants({ busca: "", page: 0, size: PAGE_SIZE }),
      fetchPerfumeOptions(),
    ])
      .then(([pageResult, optionsResult]) => {
        if (currentRequestId !== requestId.current) return;
        if (pageResult.status === "rejected") throw pageResult.reason;
        const page = pageResult.value;
        if (optionsResult.status === "fulfilled") {
          setPerfumeOptions(optionsResult.value);
        } else {
          setError("Os decants foram carregados, mas não foi possível carregar os perfumes para vínculo.");
        }
        setDecants(page.content);
        setCurrentPageState(1);
        setTotalElements(page.totalElements);
        setTotalPages(Math.max(1, page.totalPages));
      })
      .catch(() => {
        if (currentRequestId === requestId.current) setError("Não foi possível carregar os decants.");
      })
      .finally(() => {
        if (currentRequestId === requestId.current) setIsLoading(false);
      });
  }, []);

  const loadPage = async (page: number, busca: string) => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetchDecants({ busca, page: page - 1, size: PAGE_SIZE });
      if (currentRequestId !== requestId.current) return;
      setDecants(response.content);
      setCurrentPageState(page);
      setTotalElements(response.totalElements);
      setTotalPages(Math.max(1, response.totalPages));
    } catch {
      if (currentRequestId !== requestId.current) return;
      setError("Não foi possível carregar os decants.");
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  };

  const searchBy = async (busca: string) => {
    setSubmittedSearch(busca);
    await loadPage(1, busca);
  };

  const submitSearch = () => searchBy(search.trim());

  useEffect(() => {
    if (debouncedSearch === submittedSearch) return;
    void searchBy(debouncedSearch);
  }, [debouncedSearch]);

  const setCurrentPage = async (page: number) => {
    await loadPage(page, submittedSearch);
  };

  const filtered = decants;

  const handleSave = async (values: DecantModalFormValues) => {
    setError("");
    try {
      if (editDecant) {
        const saved = await updateDecant(editDecant, values);
        setDecants(prev => prev.map(decant => decant.id === saved.id ? saved : decant));
      } else {
        const saved = await createDecant(values);
        setDecants(prev => [...prev, saved].slice(0, PAGE_SIZE));
        setTotalElements(totalElements + 1);
        setTotalPages(Math.max(1, Math.ceil((totalElements + 1) / PAGE_SIZE)));
        if (totalElements >= PAGE_SIZE || submittedSearch) await loadPage(1, submittedSearch);
      }
      setEditDecant(null);
      setShowModal(false);
    } catch (requestError) {
      setError("Não foi possível salvar o decant.");
      throw requestError;
    }
  };
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const confirmDelete = async () => {
    if (!deleteDecant) return;
    setError("");
    try {
      const deletedId = await removeDecant(deleteDecant);
      setDecants(prev => prev.filter(decant => decant.id !== deletedId));
      const remaining = Math.max(0, totalElements - 1);
      const remainingPages = Math.max(1, Math.ceil(remaining / PAGE_SIZE));
      setTotalElements(remaining);
      setTotalPages(remainingPages);
      if (totalElements > PAGE_SIZE || submittedSearch) await loadPage(Math.min(currentPage, remainingPages), submittedSearch);
      setDeleteDecant(null);
    } catch {
      setError("Não foi possível excluir o decant.");
    }
  };
  return {
    canManagePrices: currentUser?.cargo === "Administrador",
    decants,
    perfumeOptions,
    isLoading,
    error,
    showModal,
    setShowModal,
    editDecant,
    setEditDecant,
    deleteDecant,
    setDeleteDecant,
    search,
    setSearch,
    submitSearch,
    currentPage,
    setCurrentPage,
    totalElements,
    totalPages,
    firstItem: filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
    lastItem: Math.min((currentPage - 1) * PAGE_SIZE + filtered.length, totalElements),
    filtered,
    handleSave,
    fmt,
    confirmDelete
  };
}
