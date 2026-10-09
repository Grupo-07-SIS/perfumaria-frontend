import { useBodySplashFacade } from "./facade/useBodySplashFacade";
import { BodySplashView } from "./components/BodySplashView";
import { useApp } from "../../core/store/AppContext";
export function BodySplashPage() {
  const facade = useBodySplashFacade();
  const { currentUser } = useApp();
  return <BodySplashView {...facade} canManagePrices={currentUser?.cargo === "Administrador"} />;
}
