import { useApp } from "../../../core/store/AppContext";
export function usePeopleRepository() {
  const {
    fornecedores,
    setFornecedores,
    currentUser
  } = useApp();
  return {
    fornecedores,
    setFornecedores,
    currentUser
  };
}
