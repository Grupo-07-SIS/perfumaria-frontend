import { useApp } from "../../../core/store/AppContext";
export function useSalesHistoryRepository() {
  const {
    vendas,
    updateVenda,
    currentUser
  } = useApp();
  return {
    vendas,
    updateVenda,
    currentUser
  };
}
