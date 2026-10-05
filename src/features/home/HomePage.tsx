import { useHomeFacade } from "./facade/useHomeFacade";
import { HomeView } from "./components/HomeView";
export function HomePage() {
  const facade = useHomeFacade();
  return <HomeView {...facade} />;
}
