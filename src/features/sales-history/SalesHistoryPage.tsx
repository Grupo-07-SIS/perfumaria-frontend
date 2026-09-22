import { useSalesHistoryFacade } from "./facade/useSalesHistoryFacade";
import { SalesHistoryView } from "./components/SalesHistoryView";

export function SalesHistoryPage() {
  const facade = useSalesHistoryFacade();
  return <SalesHistoryView {...facade} />;
}
