import { useDecantsFacade } from "./facade/useDecantsFacade";
import { DecantsView } from "./components/DecantsView";
import { useApp } from "../../core/store/AppContext";
export function DecantsPage() {
  const facade = useDecantsFacade();
  const { currentUser } = useApp();
  return <DecantsView {...facade} canManagePrices={currentUser?.cargo === "Administrador"} />;
}
