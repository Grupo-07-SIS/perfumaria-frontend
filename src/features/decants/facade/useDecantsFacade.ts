import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import type { Decant, DecantModalFormValues, PerfumeOption } from "../models/decants.models";
import { createDecant, fetchDecants, fetchPerfumeOptions, removeDecant, updateDecant } from "../services/decants.service";

const PAGE_SIZE = 10;

export function useDecantsFacade() {
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
  const [totalPages, setTotalPages] = useState(0);
  const requestId = useRef(0);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    Promise.all([
      fetchDecants({ busca: "", page: 0, size: PAGE_SIZE }),
      fetchPerfumeOptions(),
    ])
      .then(([page, options]) => {
        setPerfumeOptions(options);
        if (currentRequestId !== requestId.current) return;
        setDecants(page.content);
        setCurrentPageState(1);
        setTotalElements(page.totalElements);
        setTotalPages(page.totalPages);
      })
      .catch(() => setError("Não foi possível carregar os decants."))
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
      setTotalPages(response.totalPages);
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
        setDecants(prev => [...prev, saved]);
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
      setDeleteDecant(null);
    } catch {
      setError("Não foi possível excluir o decant.");
    }
  };
  return {
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
    filtered,
    handleSave,
    fmt,
    confirmDelete
  };
}
