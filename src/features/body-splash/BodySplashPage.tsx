import { useBodySplashFacade } from "./facade/useBodySplashFacade";
import { BodySplashView } from "./components/BodySplashView";

export function BodySplashPage() {
  const facade = useBodySplashFacade();
  return <BodySplashView {...facade} />;
}
