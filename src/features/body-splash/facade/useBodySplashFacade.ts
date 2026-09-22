import { useState } from "react";
import type { BodySplashItem } from "../models/body-splash.models";
import { initialItems } from "../repository/body-splash.repository";

export function useBodySplashFacade() {
const [items, setItems] = useState<BodySplashItem[]>(initialItems);
const [showModal, setShowModal] = useState(false);
const [editItem, setEditItem] = useState<BodySplashItem | null>(null);
const [deleteItem, setDeleteItem] = useState<BodySplashItem | null>(null);
const [search, setSearch] = useState("");
const filtered = items.filter(d => d.produto.toLowerCase().includes(search.toLowerCase()));
const handleSave = (data: Omit<BodySplashItem, "id">) => {
    if (editItem) {
      setItems(prev => prev.map(d => d.id === editItem.id ? {
        ...d,
        ...data
      } : d));
    } else {
      const newId = Math.max(...items.map(d => d.id), 0) + 1;
      setItems(prev => [...prev, {
        id: newId,
        ...data
      }]);
    }
    setEditItem(null);
    setShowModal(false);
  };
const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
return { items, setItems, showModal, setShowModal, editItem, setEditItem, deleteItem, setDeleteItem, search, setSearch, filtered, handleSave, fmt };
}
