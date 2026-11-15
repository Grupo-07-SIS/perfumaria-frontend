import { useApp } from "../../../core/store/AppContext";
export function usePeopleRepository() {
  const {
    currentUser
  } = useApp();
  return {
    currentUser
  };
}
