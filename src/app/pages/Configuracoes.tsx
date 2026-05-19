import { useState } from "react";
import { Save, CheckCircle, Shield, Package, SlidersHorizontal, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useApp } from "../context/AppContext";

type Section = "estoque" | "seguranca";

export function Configuracoes() {
  const { stockThresholds, setStockThresholds } = useApp();
  const [activeSection, setActiveSection] = useState<Section>("estoque");
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  /* ── Estoque ── */
  const [criticoLimit, setCriticoLimit] = useState(String(stockThresholds.critico));

  /* ── Segurança – Troca de senha ── */
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [errosSenha, setErrosSenha] = useState<Record<string, string>>({});

  /* ── Segurança – Troca de e-mail ── */
  const [novoEmail, setNovoEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [senhaConfEmail, setSenhaConfEmail] = useState("");
  const [errosEmail, setErrosEmail] = useState<Record<string, string>>({});

  const showSuccess = (msg: string) => {
    setSavedMsg(msg);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveEstoque = () => {
    const critico = parseInt(criticoLimit);
    if (!isNaN(critico) && critico >= 1) {
      setStockThresholds({ critico });
    }
    showSuccess("Configurações de estoque salvas com sucesso!");
  };

  const handleSaveSenha = () => {
    const e: Record<string, string> = {};
    if (!senhaAtual) e.senhaAtual = "Informe a senha atual.";
    if (!novaSenha) e.novaSenha = "Informe a nova senha.";
    else if (novaSenha.length < 6) e.novaSenha = "Mínimo de 6 caracteres.";
    if (novaSenha !== confirmSenha) e.confirmSenha = "As senhas não coincidem.";
    if (Object.keys(e).length > 0) { setErrosSenha(e); return; }
    setErrosSenha({});
    setSenhaAtual(""); setNovaSenha(""); setConfirmSenha("");
    showSuccess("Senha alterada com sucesso!");
  };

  const handleSaveEmail = () => {
    const e: Record<string, string> = {};
    if (!novoEmail.trim()) e.novoEmail = "Informe o novo e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) e.novoEmail = "E-mail inválido.";
    if (novoEmail !== confirmEmail) e.confirmEmail = "Os e-mails não coincidem.";
    if (!senhaConfEmail) e.senhaConfEmail = "Confirme com sua senha atual.";
    if (Object.keys(e).length > 0) { setErrosEmail(e); return; }
    setErrosEmail({});
    setNovoEmail(""); setConfirmEmail(""); setSenhaConfEmail("");
    showSuccess("E-mail de acesso alterado com sucesso!");
  };

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "estoque", label: "Configurações de estoque", icon: <Package size={16} /> },
    { key: "seguranca", label: "Segurança", icon: <Shield size={16} /> },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <h1 className="text-[#26221E]">Configurações</h1>
        <p className="text-xs text-gray-400 mt-0.5">Gerencie as configurações do sistema</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all border-l-2 ${
                  activeSection === s.key
                    ? "border-[#A67449] text-[#A67449] bg-amber-50"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-4">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-green-700 bg-green-50 border border-green-200" role="status" aria-live="polite">
              <CheckCircle size={16} /> {savedMsg}
            </div>
          )}

          {/* ─── Estoque ─── */}
          {activeSection === "estoque" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6">
              <h2 className="text-[#26221E] mb-1">Configurações de estoque</h2>
              <p className="text-xs text-gray-400 mb-5">Defina os limites numéricos para cada status de estoque</p>

              <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100" style={{ background: "#F9F5F1" }}>
                  <SlidersHorizontal size={15} style={{ color: "#A67449" }} />
                  <span className="text-sm font-medium text-gray-700">Limites de status do estoque</span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-red-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">Esgotado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Fixo — ativado sempre que o estoque = 0</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-lg font-mono">= 0 (fixo)</span>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl border border-amber-100 bg-amber-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">Crítico</p>
                      <p className="text-xs text-gray-400 mt-0.5">Ativado quando o estoque é ≤ ao valor definido e &gt; 0</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-gray-400">≤</span>
                      <input
                        type="number"
                        min={1}
                        value={criticoLimit}
                        onChange={(e) => setCriticoLimit(e.target.value)}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#A67449] text-center"
                      />
                      <span className="text-xs text-gray-400">un.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl border border-green-100 bg-green-50/40">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">OK</p>
                      <p className="text-xs text-gray-400 mt-0.5">Ativado quando o estoque é &gt; limite crítico</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-lg font-mono">
                      &gt; {criticoLimit || stockThresholds.critico}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveEstoque}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
                  style={{ background: "#A67449" }}
                >
                  <Save size={15} /> Salvar configurações
                </button>
              </div>
            </div>
          )}

          {/* ─── Segurança ─── */}
          {activeSection === "seguranca" && (
            <div className="flex flex-col gap-4">
              {/* Troca de senha */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F9F5F1" }}>
                    <Lock size={15} style={{ color: "#A67449" }} />
                  </div>
                  <div>
                    <h2 className="text-[#26221E]">Alterar senha</h2>
                    <p className="text-xs text-gray-400">Troque a senha da conta logada</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-w-sm">
                  {[
                    { label: "Senha atual", key: "senhaAtual", val: senhaAtual, set: setSenhaAtual },
                    { label: "Nova senha", key: "novaSenha", val: novaSenha, set: setNovaSenha },
                    { label: "Confirmar nova senha", key: "confirmSenha", val: confirmSenha, set: setConfirmSenha },
                  ].map(({ label, key, val, set }) => (
                    <div key={key}>
                      <label className="text-sm text-gray-700 block mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type={showSenha ? "text" : "password"}
                          value={val}
                          onChange={(e) => { set(e.target.value); setErrosSenha((p) => ({ ...p, [key]: "" })); }}
                          placeholder="••••••••"
                          className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors pr-9 ${(errosSenha as Record<string,string>)[key] ? "border-red-400" : "border-gray-200 focus:border-[#A67449]"}`}
                        />
                        {key === "senhaAtual" && (
                          <button
                            type="button"
                            onClick={() => setShowSenha(!showSenha)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                      {(errosSenha as Record<string,string>)[key] && <p className="text-xs text-red-600 mt-1">{(errosSenha as Record<string,string>)[key]}</p>}
                    </div>
                  ))}
                </div>

                <div className="flex justify-start mt-5">
                  <button
                    onClick={handleSaveSenha}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ background: "#A67449" }}
                  >
                    <Save size={15} /> Alterar senha
                  </button>
                </div>
              </div>

              {/* Troca de e-mail */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F9F5F1" }}>
                    <Mail size={15} style={{ color: "#A67449" }} />
                  </div>
                  <div>
                    <h2 className="text-[#26221E]">Alterar e-mail de acesso</h2>
                    <p className="text-xs text-gray-400">Troque o e-mail utilizado para login nesta conta</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 mb-4 max-w-sm">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">E-mail atual</p>
                    <p className="text-sm text-gray-700">admin@canalperfumado.com.br</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-w-sm">
                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">Novo e-mail <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={novoEmail}
                      onChange={(e) => { setNovoEmail(e.target.value); setErrosEmail((p) => ({ ...p, novoEmail: "" })); }}
                      placeholder="novo@canalperfumado.com.br"
                      className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors ${errosEmail.novoEmail ? "border-red-400" : "border-gray-200 focus:border-[#A67449]"}`}
                    />
                    {errosEmail.novoEmail && <p className="text-xs text-red-600 mt-1">{errosEmail.novoEmail}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">Confirmar novo e-mail <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => { setConfirmEmail(e.target.value); setErrosEmail((p) => ({ ...p, confirmEmail: "" })); }}
                      placeholder="Repita o novo e-mail"
                      className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors ${errosEmail.confirmEmail ? "border-red-400" : "border-gray-200 focus:border-[#A67449]"}`}
                    />
                    {errosEmail.confirmEmail && <p className="text-xs text-red-600 mt-1">{errosEmail.confirmEmail}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">Senha atual (confirmação) <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      value={senhaConfEmail}
                      onChange={(e) => { setSenhaConfEmail(e.target.value); setErrosEmail((p) => ({ ...p, senhaConfEmail: "" })); }}
                      placeholder="••••••••"
                      className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-colors ${errosEmail.senhaConfEmail ? "border-red-400" : "border-gray-200 focus:border-[#A67449]"}`}
                    />
                    {errosEmail.senhaConfEmail && <p className="text-xs text-red-600 mt-1">{errosEmail.senhaConfEmail}</p>}
                  </div>
                </div>

                <div className="flex justify-start mt-5">
                  <button
                    onClick={handleSaveEmail}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ background: "#A67449" }}
                  >
                    <Save size={15} /> Alterar e-mail
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
