import { useApp } from "../../../core/store/AppContext";
export function usePeopleRepository() {
  const {
    clientes,
    setClientes,
    fornecedores,
    setFornecedores,
    funcionarios,
    setFuncionarios,
    currentUser
  } = useApp();
  return {
    clientes,
    setClientes,
    fornecedores,
    setFornecedores,
    funcionarios,
    setFuncionarios,
    currentUser
  };
}
