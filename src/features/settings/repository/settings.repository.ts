import { useApp } from "../../../core/store/AppContext";
export function useSettingsRepository() {
  const {
    stockThresholds,
    setStockThresholds
  } = useApp();
  return {
    stockThresholds,
    setStockThresholds
  };
}
