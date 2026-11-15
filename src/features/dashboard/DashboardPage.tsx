import { useDashboardFacade } from "./facade/useDashboardFacade";
import { DashboardView } from "./components/DashboardView";
export function DashboardPage() {
  const facade = useDashboardFacade();
  return <DashboardView {...facade} />;
}
