import { useState } from "react";
import type { Decant } from "../models/decants.models";
import { initialDecants } from "../repository/decants.repository";
export function useDecantsFacade() {
  const [decants, setDecants] = useState<Decant[]>(initialDecants);
  const [showModal, setShowModal] = useState(false);
  const [editDecant, setEditDecant] = useState<Decant | null>(null);
  const [deleteDecant, setDeleteDecant] = useState<Decant | null>(null);
  const [search, setSearch] = useState("");
  const filtered = decants.filter(d => d.perfume.toLowerCase().includes(search.toLowerCase()));
  const handleSave = (data: Omit<Decant, "id">) => {
    if (editDecant) {
      setDecants(prev => prev.map(d => d.id === editDecant.id ? {
        ...d,
        ...data
      } : d));
    } else {
      const newId = Math.max(...decants.map(d => d.id), 0) + 1;
      setDecants(prev => [...prev, {
        id: newId,
        ...data
      }]);
    }
    setEditDecant(null);
    setShowModal(false);
  };
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const confirmDelete = () => {
    if (!deleteDecant) return;
    setDecants(prev => prev.filter(d => d.id !== deleteDecant.id));
    setDeleteDecant(null);
  };
  return {
    decants,
    setDecants,
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
