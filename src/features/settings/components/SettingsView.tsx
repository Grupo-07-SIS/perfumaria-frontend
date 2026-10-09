import type { useSettingsFacade } from "../facade/useSettingsFacade";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { CheckCircle, SlidersHorizontal, Save, Lock, EyeOff, Eye, Mail } from "lucide-react";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
export function SettingsView({
  accountError,
  currentUser,
  isAccountSaving,
  stockError,
  isStockLoading,
  isStockSaving,
  stockDisabled,
  canRetryStock,
  retryStock,
  stockThresholds,
  activeSection,
  setActiveSection,
  saved,
  savedMsg,
  criticoLimit,
  setCriticoLimit,
  senhaAtual,
  setSenhaAtual,
  novaSenha,
  setNovaSenha,
  confirmSenha,
  setConfirmSenha,
  showSenha,
  setShowSenha,
  errosSenha,
  setErrosSenha,
  novoEmail,
  setNovoEmail,
  confirmEmail,
  setConfirmEmail,
  senhaConfEmail,
  setSenhaConfEmail,
  errosEmail,
  setErrosEmail,
  handleSaveEstoque,
  handleSaveSenha,
  handleSaveEmail,
  sections
}: ReturnType<typeof useSettingsFacade>) {
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <h1 data-tour="tour-settings-heading" className="peract-font-color-default">Configurações</h1>
        <p className="text-xs peract-font-color-muted mt-0.5">Gerencie as configurações do sistema</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <PeractCard data-tour="tour-settings-sections" className="peract-bg-card rounded-xl border peract-border-color shadow-sm overflow-hidden">
            {sections.map(s => <PeractButtonPrimitive key={s.key} data-tour={s.key === "seguranca" ? "tour-settings-security-tab" : undefined} onClick={() => setActiveSection(s.key)} className={`w-full min-w-0 flex items-center justify-start gap-3 whitespace-normal px-4 py-3 text-sm text-left transition-all border-l-2 ${activeSection === s.key ? "border-[#A67449] text-[#A67449] bg-amber-50" : "border-transparent text-gray-600 hover:bg-gray-50"}`} variant="plain" size="plain">
              <span className="shrink-0">{s.icon}</span>
              <span className="min-w-0 flex-1 whitespace-normal break-words">{s.label}</span>
              </PeractButtonPrimitive>)}
          </PeractCard>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-4">
          {activeSection === "seguranca" && accountError && <p role="alert" className="text-sm text-red-600">{accountError}</p>}
          {saved && <div className="peract-feedback-enter flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-green-700 bg-green-50 border border-green-200" role="status" aria-live="polite">
              <CheckCircle size={16} /> {savedMsg}
            </div>}

          {/* ─── Estoque ─── */}
          {activeSection === "estoque" && <PeractCard data-tour="tour-settings-stock" className="peract-bg-card rounded-xl border peract-border-color shadow-sm p-4 lg:p-6">
              <h2 className="peract-font-color-default mb-1">Configurações de estoque</h2>
              <p className="text-xs peract-font-color-muted mb-5">Defina os limites numéricos para cada status de estoque</p>

              {isStockLoading && <p className="mb-4 text-sm peract-font-color-muted" role="status">Carregando limite de estoque...</p>}
              {stockError && <p className="mb-4 text-sm text-red-600" role="alert">{stockError}</p>}
              {canRetryStock && <PeractButtonPrimitive onClick={retryStock} className="mb-4">Tentar novamente</PeractButtonPrimitive>}

              <div className="border peract-border-color rounded-xl overflow-hidden mb-6">
                <div className="flex items-center gap-2 px-4 py-3 border-b peract-border-color" style={{
              background: "#F9F5F1"
            }}>
                  <SlidersHorizontal size={15} style={{
                color: "#A67449"
              }} />
                  <span className="text-sm font-medium text-gray-700">Limites de status do estoque</span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-3 rounded-xl border peract-border-color bg-red-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium peract-font-color-default">Esgotado</p>
                      <p className="text-xs peract-font-color-muted mt-0.5">Fixo — ativado sempre que o estoque = 0</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 peract-font-color-muted rounded-lg font-mono">= 0 (fixo)</span>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl border border-amber-100 bg-amber-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium peract-font-color-default">Crítico</p>
                      <p className="text-xs peract-font-color-muted mt-0.5">Ativado quando o estoque é ≤ ao valor definido e &gt; 0</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs peract-font-color-muted">≤</span>
                      <PeractInputControl aria-label="Limite crítico de estoque" disabled={stockDisabled} type="number" min={1} max={2147483647} step={1} value={criticoLimit} onChange={e => setCriticoLimit(e.target.value)} className="w-24 border peract-border-color rounded-lg px-2 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#A67449] text-center" />
                      <span className="text-xs peract-font-color-muted">un.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl border border-green-100 bg-green-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium peract-font-color-default">OK</p>
                      <p className="text-xs peract-font-color-muted mt-0.5">Ativado quando o estoque é &gt; limite crítico</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 peract-font-color-muted rounded-lg font-mono">
                      &gt; {criticoLimit || stockThresholds.critico}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <PeractButtonPrimitive onClick={() => void handleSaveEstoque()} disabled={stockDisabled} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity" style={{
              background: "#A67449"
            }} variant="plain" size="plain">
                  <Save size={15} /> {isStockSaving ? "Salvando..." : "Salvar configurações"}
                </PeractButtonPrimitive>
              </div>
            </PeractCard>}

          {/* ─── Segurança ─── */}
          {activeSection === "seguranca" && <div className="flex flex-col gap-4">
              {/* Troca de senha */}
              <PeractCard data-tour="tour-settings-password" className="peract-bg-card rounded-xl border peract-border-color shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                background: "#F9F5F1"
              }}>
                    <Lock size={15} style={{
                  color: "#A67449"
                }} />
                  </div>
                  <div>
                    <h2 className="peract-font-color-default">Alterar senha</h2>
                    <p className="text-xs peract-font-color-muted">Troque a senha da conta logada</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-w-sm">
                  {[{
                label: "Senha atual",
                key: "senhaAtual",
                val: senhaAtual,
                set: setSenhaAtual
              }, {
                label: "Nova senha",
                key: "novaSenha",
                val: novaSenha,
                set: setNovaSenha
              }, {
                label: "Confirmar nova senha",
                key: "confirmSenha",
                val: confirmSenha,
                set: setConfirmSenha
              }].map(({
                label,
                key,
                val,
                set
              }) => <PeractField key={key}>
                      <PeractLabel className="text-sm text-gray-700 block mb-1.5">{label}</PeractLabel>
                      <div className="relative">
                        <PeractInputControl type={showSenha ? "text" : "password"} value={val} onChange={e => {
                    set(e.target.value);
                    setErrosSenha(p => ({
                      ...p,
                      [key]: ""
                    }));
                  }} placeholder="••••••••" className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors pr-9 ${(errosSenha as Record<string, string>)[key] ? "border-red-400" : "peract-border-color focus:border-[#A67449]"}`} />
                        {key === "senhaAtual" && <PeractButtonPrimitive type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-2.5 top-1/2 -translate-y-1/2 peract-font-color-muted hover:text-gray-600" variant="plain" size="plain">
                            {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                          </PeractButtonPrimitive>}
                      </div>
                      {(errosSenha as Record<string, string>)[key] && <p className="text-xs text-red-600 mt-1">{(errosSenha as Record<string, string>)[key]}</p>}
                    </PeractField>)}
                </div>

                <div className="flex justify-start mt-5">
                  <PeractButtonPrimitive onClick={() => void handleSaveSenha()} disabled={isAccountSaving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-60" style={{
                background: "#A67449"
              }} variant="plain" size="plain">
                    <Save size={15} /> {isAccountSaving ? "Salvando..." : "Alterar senha"}
                  </PeractButtonPrimitive>
                </div>
              </PeractCard>

              {/* Troca de e-mail */}
              <PeractCard data-tour="tour-settings-email" className="peract-bg-card rounded-xl border peract-border-color shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                background: "#F9F5F1"
              }}>
                    <Mail size={15} style={{
                  color: "#A67449"
                }} />
                  </div>
                  <div>
                    <h2 className="peract-font-color-default">Alterar e-mail de acesso</h2>
                    <p className="text-xs peract-font-color-muted">Troque o e-mail utilizado para login nesta conta</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg border peract-border-color bg-gray-50 mb-4 max-w-sm">
                  <Mail size={13} className="peract-font-color-muted shrink-0" />
                  <div>
                    <p className="text-xs peract-font-color-muted">E-mail atual</p>
                    <p className="text-sm text-gray-700">{currentUser?.email ?? "—"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-w-sm">
                  <PeractField>
                    <PeractLabel className="text-sm text-gray-700 block mb-1.5">Novo e-mail <span className="text-red-500">*</span></PeractLabel>
                    <PeractInputControl type="email" maxLength={45} value={novoEmail} onChange={e => {
                  setNovoEmail(e.target.value);
                  setErrosEmail(p => ({
                    ...p,
                    novoEmail: ""
                  }));
                }} placeholder="novo@canalperfumado.com.br" className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors ${errosEmail.novoEmail ? "border-red-400" : "peract-border-color focus:border-[#A67449]"}`} />
                    {errosEmail.novoEmail && <p className="text-xs text-red-600 mt-1">{errosEmail.novoEmail}</p>}
                  </PeractField>
                  <PeractField>
                    <PeractLabel className="text-sm text-gray-700 block mb-1.5">Confirmar novo e-mail <span className="text-red-500">*</span></PeractLabel>
                    <PeractInputControl type="email" maxLength={45} value={confirmEmail} onChange={e => {
                  setConfirmEmail(e.target.value);
                  setErrosEmail(p => ({
                    ...p,
                    confirmEmail: ""
                  }));
                }} placeholder="Repita o novo e-mail" className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors ${errosEmail.confirmEmail ? "border-red-400" : "peract-border-color focus:border-[#A67449]"}`} />
                    {errosEmail.confirmEmail && <p className="text-xs text-red-600 mt-1">{errosEmail.confirmEmail}</p>}
                  </PeractField>
                  <PeractField>
                    <PeractLabel className="text-sm text-gray-700 block mb-1.5">Senha atual (confirmação) <span className="text-red-500">*</span></PeractLabel>
                    <PeractInputControl type="password" value={senhaConfEmail} onChange={e => {
                  setSenhaConfEmail(e.target.value);
                  setErrosEmail(p => ({
                    ...p,
                    senhaConfEmail: ""
                  }));
                }} placeholder="••••••••" className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors ${errosEmail.senhaConfEmail ? "border-red-400" : "peract-border-color focus:border-[#A67449]"}`} />
                    {errosEmail.senhaConfEmail && <p className="text-xs text-red-600 mt-1">{errosEmail.senhaConfEmail}</p>}
                  </PeractField>
                </div>

                <div className="flex justify-start mt-5">
                  <PeractButtonPrimitive onClick={() => void handleSaveEmail()} disabled={isAccountSaving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-60" style={{
                background: "#A67449"
              }} variant="plain" size="plain">
                    <Save size={15} /> {isAccountSaving ? "Salvando..." : "Alterar e-mail"}
                  </PeractButtonPrimitive>
                </div>
              </PeractCard>
            </div>}
        </div>
      </div>
    </div>;
}
