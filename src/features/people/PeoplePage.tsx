import { usePeopleFacade } from "./facade/usePeopleFacade";
import { PeopleView } from "./components/PeopleView";
export function PeoplePage() {
  const facade = usePeopleFacade();
  return <PeopleView {...facade} />;
}
