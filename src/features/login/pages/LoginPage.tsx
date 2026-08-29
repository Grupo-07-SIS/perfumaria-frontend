import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import logoImg from "figma:asset/19603bc35fe7f283ff1a83c590f928c9d0bfe9cf.png";
import { useApp } from "../../../app/context/AppContext";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractInput } from "../../../shared/components/peract-input";
import { DEMO_ACCOUNTS } from "../config/demoAccounts";
import { LoginDemoAccounts } from "../components/LoginDemoAccounts";
import { LoginHeroPanel } from "../components/LoginHeroPanel";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useApp();
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(({ email, password }) => {
    setLoading(true);
    setAuthError("");

    window.setTimeout(() => {
      const hasLoggedIn = login(email.trim(), password);

      if (!hasLoggedIn) {
        setAuthError("E-mail ou senha incorretos.");
        setLoading(false);
      }
    }, 700);
  });

  return (
    <div className="min-h-screen peract-bg-page flex">
      <LoginHeroPanel />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-6 py-12">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(194,153,88,0.06) 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(194,153,88,0.04) 0%, transparent 70%)" }} />

        <PeractCard className="relative w-full max-w-[380px] border-none p-0 shadow-none" style={{ background: "transparent" }}>
          <div className="mb-8 flex justify-center gap-3 lg:hidden">
            <img src={logoImg} alt="Canal Perfumado" className="h-12 w-12 rounded-full border-2 object-cover" style={{ borderColor: "#c29958" }} />
            <div>
              <p className="peract-serif-font text-sm text-[#1a1a1a] tracking-[0.06em]">Canal Perfumado</p>
              <p className="peract-font-color-accent text-xs tracking-[0.14em]">DECANTS</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-5 bg-[color:var(--brand-accent)]" />
              <span className="peract-font-color-accent text-xs tracking-[0.16em]">ACESSO AO SISTEMA</span>
            </div>
            <h1 className="peract-serif-font mb-2 text-[1.6rem] font-normal text-[#1a1a1a]">Bem-vindo de volta</h1>
            <p className="text-sm text-[#6b6b68]">Entre com suas credenciais para continuar</p>
          </div>

          {authError ? (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(220,38,38,0.06)", borderColor: "rgba(220,38,38,0.18)", color: "#dc2626" }} role="alert">
              <AlertCircle size={15} className="shrink-0" /> {authError}
            </div>
          ) : null}

          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Preencha o e-mail.",
                pattern: {
                  message: "Informe um e-mail válido.",
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                },
              }}
              render={({ field }) => (
                <PeractInput
                  autoComplete="email"
                  errorText={errors.email?.message}
                  icon={<Mail size={15} />}
                  label="E-MAIL"
                  onValueChange={(value) => {
                    setAuthError("");
                    field.onChange(value);
                  }}
                  placeholder="seu@email.com"
                  type="email"
                  validation={errors.email ? "invalid" : "non-validation"}
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{ required: "Preencha a senha." }}
              render={({ field }) => (
                <PeractInput
                  autoComplete="current-password"
                  errorText={errors.password?.message}
                  icon={<Lock size={15} />}
                  label="SENHA"
                  onValueChange={(value) => {
                    setAuthError("");
                    field.onChange(value);
                  }}
                  placeholder="••••••••"
                  rightAdornment={
                    <button
                      aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                      className="transition-opacity hover:opacity-80"
                      onClick={() => setShowPass((currentValue) => !currentValue)}
                      style={{ color: "#6b6b68" }}
                      type="button"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  type={showPass ? "text" : "password"}
                  validation={errors.password ? "invalid" : "non-validation"}
                  value={field.value}
                />
              )}
            />

            <PeractButton className="mt-2 w-full tracking-[0.04em]" disabled={loading} theme="primary" type="submit">
              {loading ? <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
              {loading ? "Verificando..." : "Entrar no sistema"}
            </PeractButton>
          </form>

          <LoginDemoAccounts
            accounts={[...DEMO_ACCOUNTS]}
            onSelectAccount={(account) => {
              setAuthError("");
              setValue("email", account.email);
              setValue("password", account.senha);
            }}
          />

          <p className="mt-6 text-center text-xs tracking-[0.06em] text-[#c8c8c5]">© 2026 CANAL PERFUMADO DECANTS</p>
        </PeractCard>
      </div>
    </div>
  );
}