import { useState } from "react";
import { useSearchParams } from "react-router";
import { Save, CheckCircle, Shield, Package, SlidersHorizontal, Mail, Lock } from "lucide-react";
import { useApp } from "../../app/context/AppContext";
import { environment } from "../../environment";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractButton } from "../../shared/components/peract-button";
import { PeractInput } from "../../shared/components/peract-input";
import { SecurityQuestionsForm } from "./components/SecurityQuestionsForm";

type Section = "estoque" | "seguranca";

export function SettingsPage() {
  const { stockThresholds, setStockThresholds, currentUser } = useApp();
  const [params, setParams] = useSearchParams();
  const isAdmin = currentUser?.cargo === "Administrador";
  const activeSection: Section = isAdmin && params.get("secao") !== "seguranca" ? "estoque" : "seguranca";
  const [criticoLimit, setCriticoLimit] = useState(String(stockThresholds.critico));
  const [saved, setSaved] = useState(false);
  const handleSaveEstoque = () => {
    if (!isAdmin) return;
    const critico = parseInt(criticoLimit);
    if (!isNaN(critico) && critico >= 1) { setStockThresholds({ critico }); setSaved(true); }
  };
  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    ...(isAdmin ? [{ key: "estoque" as const, label: "Configurações de estoque", icon: <Package size={16} /> }] : []),
    { key: "seguranca", label: "Segurança", icon: <Shield size={16} /> },
  ];
  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <h1 className="peract-serif-font">Configurações</h1>
        <p className="text-xs peract-font-color-muted mt-0.5">Gerencie as configurações do sistema e a segurança da sua conta</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0">
          <PeractCard className="overflow-hidden">
            {sections.map(section => <PeractButton key={section.key} theme="secondary" className="w-full justify-start gap-3 px-4 py-3 text-left" aria-pressed={activeSection === section.key} action={() => { setSaved(false); setParams({ secao: section.key }); }}>{section.icon}{section.label}</PeractButton>)}
          </PeractCard>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {saved && activeSection === "estoque" && <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-green-700 bg-green-50 border border-green-200" role="status"><CheckCircle size={16} /> Configurações de estoque salvas com sucesso!</div>}
          {isAdmin && activeSection === "estoque" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6">
              <h2 className="text-[#26221E] mb-1">Configurações de estoque</h2>
              <p className="text-xs text-gray-400 mb-5">Defina os limites numéricos para cada status de estoque</p>
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-amber-50">
                  <SlidersHorizontal size={15} className="peract-font-color-accent" />
                  <span className="text-sm font-medium text-gray-700">Limites de status do estoque</span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-red-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-red-500" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800">Esgotado</p><p className="text-xs text-gray-400 mt-0.5">Fixo — ativado sempre que o estoque = 0</p></div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-lg font-mono">= 0 (fixo)</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-amber-100 bg-amber-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-amber-500" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800">Crítico</p><p className="text-xs text-gray-400 mt-0.5">Ativado quando o estoque é ≤ ao valor definido e &gt; 0</p></div>
                    <div className="flex items-center gap-1.5 shrink-0"><span className="text-xs text-gray-400">≤</span><input aria-label="Limite de estoque crítico" type="number" min={1} value={criticoLimit} onChange={event => setCriticoLimit(event.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#A67449] text-center" /><span className="text-xs text-gray-400">un.</span></div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-green-100 bg-green-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-green-500" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800">OK</p><p className="text-xs text-gray-400 mt-0.5">Ativado quando o estoque é &gt; limite crítico</p></div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-lg font-mono">&gt; {criticoLimit || stockThresholds.critico}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end"><PeractButton theme="primary" action={handleSaveEstoque}><Save size={15} /> Salvar configurações</PeractButton></div>
            </div>
          )}
          {activeSection === "seguranca" && <>
            {environment.features.securityQuestionsEnabled && <SecurityQuestionsForm key={currentUser?.id} />}
            <PeractCard className="p-4 lg:p-6">
              <h2 className="flex items-center gap-2 mb-2"><Lock size={16} /> Alterar senha</h2>
              <p className="text-sm peract-font-color-muted mb-4">Este bloco legado era uma simulação local, sem integração com o servidor. Está desativado para não informar uma troca que não ocorreu.</p>
              <fieldset disabled className="flex flex-col gap-4 max-w-sm" aria-label="Alteração de senha indisponível">
                <PeractInput label="Senha atual" type="password" value="" disabled />
                <PeractInput label="Nova senha" type="password" value="" disabled />
                <PeractInput label="Confirmar nova senha" type="password" value="" disabled />
                <PeractButton theme="primary" disabled>Alterar senha</PeractButton>
              </fieldset>
            </PeractCard>
            <PeractCard className="p-4 lg:p-6">
              <h2 className="flex items-center gap-2 mb-2"><Mail size={16} /> Alterar e-mail de acesso</h2>
              <p className="text-sm peract-font-color-muted mb-4">Este bloco legado também não possui integração real e está desativado. E-mail atual: {currentUser?.email}</p>
              <fieldset disabled className="flex flex-col gap-4 max-w-sm" aria-label="Alteração de e-mail indisponível">
                <PeractInput label="Novo e-mail" type="email" value="" disabled />
                <PeractInput label="Confirmar novo e-mail" type="email" value="" disabled />
                <PeractInput label="Senha atual (confirmação)" type="password" value="" disabled />
                <PeractButton theme="primary" disabled>Alterar e-mail</PeractButton>
              </fieldset>
            </PeractCard>
          </>}
        </div>
      </div>
    </div>
  );
}