import { useEffect, useState } from "react";
import type { Decant, DecantModalFormValues, PerfumeOption } from "../models/decants.models";
import { createDecant, fetchDecants, fetchPerfumeOptions, removeDecant, updateDecant } from "../services/decants.service";

export function useDecantsFacade() {
  const [decants, setDecants] = useState<Decant[]>([]);
  const [perfumeOptions, setPerfumeOptions] = useState<PerfumeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editDecant, setEditDecant] = useState<Decant | null>(null);
  const [deleteDecant, setDeleteDecant] = useState<Decant | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([fetchDecants(), fetchPerfumeOptions()])
      .then(([page, options]) => {
        setDecants(page.content);
        setPerfumeOptions(options);
      })
      .catch(() => setError("Não foi possível carregar os decants."))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = decants.filter(d => d.perfume.toLowerCase().includes(search.toLowerCase()));

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
    filtered,
    handleSave,
    fmt,
    confirmDelete
  };
}
