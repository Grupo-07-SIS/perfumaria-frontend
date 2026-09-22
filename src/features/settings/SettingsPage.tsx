import { useSettingsFacade } from "./facade/useSettingsFacade";
import { SettingsView } from "./components/SettingsView";

export function SettingsPage() {
  const facade = useSettingsFacade();
  return <SettingsView {...facade} />;
}
