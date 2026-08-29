import { LoginFormPanel } from "./components/LoginFormPanel";
import { LoginHeroPanel } from "./components/LoginHeroPanel";
import { useLoginFacade } from "./facade/useLoginFacade";

export function LoginPage() {
  const facade = useLoginFacade();

  return (
    <div className="min-h-screen peract-bg-page flex">
      <LoginHeroPanel />
      <LoginFormPanel facade={facade} />
    </div>
  );
}