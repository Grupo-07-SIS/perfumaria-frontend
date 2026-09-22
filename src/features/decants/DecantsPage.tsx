import { useDecantsFacade } from "./facade/useDecantsFacade";
import { DecantsView } from "./components/DecantsView";

export function DecantsPage() {
  const facade = useDecantsFacade();
  return <DecantsView {...facade} />;
}
