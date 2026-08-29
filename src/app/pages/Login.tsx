import { useState, FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles, ShieldCheck, UserCheck } from "lucide-react";
import logoImg from "figma:asset/19603bc35fe7f283ff1a83c590f928c9d0bfe9cf.png";
import { useApp } from "../context/AppContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PeractButton } from "../../shared/components/peract-button";

const PERFUME_BG = "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJmdW1lJTIwYm90dGxlJTIwd2hpdGUlMjBnb2xkJTIwbHV4dXJ5JTIwZmxhdCUyMGxheXxlbnwxfHx8fDE3Nzg4ODEyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080";

const DEMO_ACCOUNTS = [
  { label: "Administrador", email: "admin@canalperfumado.com.br",   senha: "admin123",  icon: <ShieldCheck size={12} />, color: "#c29958" },
  { label: "Funcionário",   email: "beatriz@canalperfumado.com.br", senha: "func123",   icon: <UserCheck size={12} />,   color: "#6366f1" },
];

export function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    setError("");
    setTimeout(() => {
      const ok = login(email.trim(), password);
      if (!ok) { setError("E-mail ou senha incorretos."); setLoading(false); }
    }, 700);
  };

  const fillAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.senha);
    setError("");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f7f6" }}>

      {/* ── Left panel — foto com overlay leve ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <ImageWithFallback src={PERFUME_BG} alt="Canal Perfumado Decants" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(255,255,255,0) 60%, rgba(255,255,255,0.35) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(247,247,246,0.45) 0%, transparent 40%)" }} />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-3 self-start px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)" }}>
            <img src={logoImg} alt="Canal Perfumado" className="w-10 h-10 rounded-full object-cover border-2 shadow" style={{ borderColor: "#c29958" }} />
            <div>
              <p className="text-sm leading-tight font-medium" style={{ color: "#1a1a1a", fontFamily: "'Georgia', serif", letterSpacing: "0.05em" }}>Canal Perfumado</p>
              <p className="text-xs" style={{ color: "#c29958", letterSpacing: "0.12em" }}>DECANTS</p>
            </div>
          </div>
          <div className="px-5 py-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(10px)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #c29958, transparent)" }} />
              <Sparkles size={13} style={{ color: "#c29958" }} />
            </div>
            <h2 className="mb-3" style={{ fontFamily: "'Georgia', serif", fontSize: "2rem", lineHeight: "1.2", fontWeight: 400, letterSpacing: "0.02em", color: "#1a1a1a" }}>
              Gestão com a<br />
              <span style={{ color: "#c29958" }}>elegância</span> que<br />
              sua marca merece.
            </h2>
            <p className="text-sm font-medium" style={{ color: "#6b6b68", letterSpacing: "0.08em" }}>SISTEMA DE GESTÃO LOGÍSTICA</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — branco ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(194,153,88,0.06) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(194,153,88,0.04) 0%, transparent 70%)" }} />

        <div className="relative w-full max-w-[380px]">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={logoImg} alt="Canal Perfumado" className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: "#c29958" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#1a1a1a", letterSpacing: "0.06em" }}>Canal Perfumado</p>
              <p className="text-xs" style={{ color: "#c29958", letterSpacing: "0.14em" }}>DECANTS</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-px" style={{ background: "#c29958" }} />
              <span className="text-xs tracking-widest" style={{ color: "#c29958", letterSpacing: "0.16em" }}>ACESSO AO SISTEMA</span>
            </div>
            <h1 className="mb-2" style={{ fontSize: "1.6rem", fontWeight: 400, fontFamily: "'Georgia', serif", letterSpacing: "0.01em", color: "#1a1a1a" }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: "#6b6b68" }}>Entre com suas credenciais para continuar</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm border"
              style={{ background: "rgba(220,38,38,0.06)", borderColor: "rgba(220,38,38,0.18)", color: "#dc2626" }} role="alert">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-2 tracking-wide" style={{ color: "#6b6b68", letterSpacing: "0.06em" }}>E-MAIL</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#c29958" }} />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="seu@email.com" autoComplete="email"
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: "#f3f3f2", border: "1px solid rgba(0,0,0,0.09)", color: "#1a1a1a" }}
                  onFocus={(e) => { e.target.style.borderColor = "#c29958"; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.09)"; e.target.style.background = "#f3f3f2"; }} />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2 tracking-wide" style={{ color: "#6b6b68", letterSpacing: "0.06em" }}>SENHA</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#c29958" }} />
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full rounded-xl pl-11 pr-12 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: "#f3f3f2", border: "1px solid rgba(0,0,0,0.09)", color: "#1a1a1a" }}
                  onFocus={(e) => { e.target.style.borderColor = "#c29958"; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.09)"; e.target.style.background = "#f3f3f2"; }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: "#6b6b68" }} aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <PeractButton
              className="mt-2 w-full tracking-[0.04em]"
              disabled={loading}
              theme="primary"
              type="submit"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />}
              {loading ? "Verificando..." : "Entrar no sistema"}
            </PeractButton>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <p className="text-xs text-center mb-3" style={{ color: "#9a9a97", letterSpacing: "0.1em" }}>CREDENCIAIS DE DEMONSTRAÇÃO</p>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <PeractButton key={acc.email} action={() => fillAccount(acc)}
                  className="h-auto w-full rounded-xl border px-4 py-3 text-left text-xs transition-all active:scale-[0.99]"
                  style={{ background: "#f7f7f6", borderColor: `${acc.color}28`, color: "inherit" }}
                  theme="secondary">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ color: acc.color }}>{acc.icon}</span>
                    <span className="font-medium" style={{ color: acc.color }}>{acc.label}</span>
                    <span className="ml-auto" style={{ color: "#9a9a97" }}>clique para preencher</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between">
                      <span style={{ color: "#9a9a97" }}>E-mail:</span>
                      <span className="font-mono" style={{ color: "#4a4a47" }}>{acc.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#9a9a97" }}>Senha:</span>
                      <span className="font-mono" style={{ color: "#4a4a47" }}>{acc.senha}</span>
                    </div>
                  </div>
                </PeractButton>
              ))}
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#c8c8c5", letterSpacing: "0.06em" }}>
            © 2026 CANAL PERFUMADO DECANTS
          </p>
        </div>
      </div>
    </div>
  );
}