import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { PeractToaster } from "../shared/components/peract-sonner/PeractSonner";

function VLibras() {
  useEffect(() => {
    const container = document.createElement("div");
    container.setAttribute("vw", "");
    container.className = "enabled";
    container.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(container);

    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.onload = () => {
      new (window as any).VLibras.Widget("https://vlibras.gov.br/app");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(container)) document.body.removeChild(container);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);
  return null;
}

function AppContent() {
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AppProvider>
      <VLibras />
      <AppContent />
      <PeractToaster />
    </AppProvider>
  );
}
