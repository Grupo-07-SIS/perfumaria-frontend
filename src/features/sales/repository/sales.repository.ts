import type { CatalogItem } from "../models/sales.models";
import { useApp } from "../../../core/store/AppContext";
export function useSalesRepository() {
  const {
    clientes,
    products,
    reduceStock,
    addVenda,
    setClientes
  } = useApp();
  return {
    clientes,
    products,
    reduceStock,
    addVenda,
    setClientes
  };
}
export const decants: CatalogItem[] = [{
  id: -1,
  nome: "Decant Chanel N°5 2ml",
  preco: 12,
  tipo: "decant",
  volume: "2ml"
}, {
  id: -2,
  nome: "Decant Chanel N°5 5ml",
  preco: 25,
  tipo: "decant",
  volume: "5ml"
}, {
  id: -3,
  nome: "Decant Dior Sauvage 5ml",
  preco: 28,
  tipo: "decant",
  volume: "5ml"
}, {
  id: -4,
  nome: "Decant Dior Sauvage 10ml",
  preco: 50,
  tipo: "decant",
  volume: "10ml"
}, {
  id: -5,
  nome: "Decant Creed Aventus 3ml",
  preco: 28,
  tipo: "decant",
  volume: "3ml"
}, {
  id: -6,
  nome: "Decant YSL Libre 2ml",
  preco: 13,
  tipo: "decant",
  volume: "2ml"
}];
export { triggerBotpressPresencialFlow } from "../../../core/services/botpress";
