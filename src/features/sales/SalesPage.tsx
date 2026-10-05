import { useSalesFacade } from "./facade/useSalesFacade";
import { SalesView } from "./components/SalesView";
export function SalesPage() {
  const facade = useSalesFacade();
  return <SalesView {...facade} />;
}
