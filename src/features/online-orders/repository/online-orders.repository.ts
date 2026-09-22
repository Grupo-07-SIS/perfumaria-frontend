import { useApp } from "../../../core/store/AppContext";

export function useOnlineOrdersRepository() {
  const { vendas, updateVendaEnvio, updateVenda } = useApp();
  return { vendas, updateVendaEnvio, updateVenda };
}

export { triggerBotpressOnlineFlow } from "../../../core/services/botpress";
