import { useOnlineOrdersFacade } from "./facade/useOnlineOrdersFacade";
import { OnlineOrdersView } from "./components/OnlineOrdersView";

export function OnlineOrdersPage() {
  const facade = useOnlineOrdersFacade();
  return <OnlineOrdersView {...facade} />;
}
