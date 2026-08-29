import { Controller } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import logoImg from "figma:asset/19603bc35fe7f283ff1a83c590f928c9d0bfe9cf.png";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractInput } from "../../../shared/components/peract-input";
import type { LoginFormFacade } from "../models/login.models";

interface LoginFormPanelProps {
  facade: LoginFormFacade;
}

export function LoginFormPanel({ facade }: LoginFormPanelProps) {
  return (
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

        {facade.authError ? (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(220,38,38,0.06)", borderColor: "rgba(220,38,38,0.18)", color: "#dc2626" }} role="alert">
            <AlertCircle size={15} className="shrink-0" /> {facade.authError}
          </div>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={facade.onSubmit}>
          <Controller
            control={facade.control}
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
                errorText={facade.errors.email?.message}
                icon={<Mail size={15} />}
                label="E-MAIL"
                onValueChange={field.onChange}
                placeholder="seu@email.com"
                type="email"
                validation={facade.errors.email ? "invalid" : "non-validation"}
                value={field.value}
              />
            )}
          />

          <Controller
            control={facade.control}
            name="password"
            rules={{ required: "Preencha a senha." }}
            render={({ field }) => (
              <PeractInput
                autoComplete="current-password"
                errorText={facade.errors.password?.message}
                icon={<Lock size={15} />}
                label="SENHA"
                onValueChange={field.onChange}
                placeholder="••••••••"
                rightAdornment={
                  <button
                    aria-label={facade.showPass ? "Ocultar senha" : "Mostrar senha"}
                    className="transition-opacity hover:opacity-80"
                    onClick={facade.togglePasswordVisibility}
                    style={{ color: "#6b6b68" }}
                    type="button"
                  >
                    {facade.showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                type={facade.showPass ? "text" : "password"}
                validation={facade.errors.password ? "invalid" : "non-validation"}
                value={field.value}
              />
            )}
          />

          <PeractButton className="mt-2 w-full tracking-[0.04em]" disabled={facade.loading} theme="primary" type="submit">
            {facade.loading ? <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
            {facade.loading ? "Verificando..." : "Entrar no sistema"}
          </PeractButton>
        </form>

        <p className="mt-6 text-center text-xs tracking-[0.06em] text-[#c8c8c5]">© 2026 CANAL PERFUMADO DECANTS</p>
      </PeractCard>
    </div>
  );
}