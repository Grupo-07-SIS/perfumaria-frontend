import { Link, Navigate } from "react-router";
import { ShieldCheck } from "lucide-react";
import { environment } from "../../environment";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractButton } from "../../shared/components/peract-button";
import { usePasswordRecoveryFacade } from "./facade/usePasswordRecoveryFacade";
import { RecoveryEmailStep } from "./components/RecoveryEmailStep";
import { RecoveryAnswersStep } from "./components/RecoveryAnswersStep";
import { RecoveryPasswordStep } from "./components/RecoveryPasswordStep";
import { RECOVERY_UNAVAILABLE } from "./config/password-recovery.config";

export function PasswordRecoveryPage() {
  const facade = usePasswordRecoveryFacade();
  if (!environment.features.securityQuestionsEnabled) return <Navigate to="/login" replace />;
  return <main className="peract-bg-page flex min-h-screen items-center justify-center px-4 py-10">
    <PeractCard className="w-full max-w-xl p-6 lg:p-8">
      <p className="peract-font-color-accent mb-2 text-xs tracking-widest">CANAL PERFUMADO DECANTS</p>
      <h1 className="peract-serif-font mb-4 text-2xl">Recuperar senha</h1>
      {facade.state.step !== "success" && <p className="mb-4 text-sm peract-font-color-muted">{RECOVERY_UNAVAILABLE}</p>}
      {facade.expiresAt && <p className="mb-4 text-sm" role="status">Esta etapa expira em <time dateTime={facade.expiresAt}>{new Date(facade.expiresAt).toLocaleString("pt-BR")}</time>. Voltar ou cancelar encerra a autorização atual.</p>}
      {facade.error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{facade.error}</p>}
      {facade.state.step === "email" && <RecoveryEmailStep key={facade.formVersion} loading={facade.loading} onSubmit={facade.start} />}
      {facade.state.step === "answers" && <RecoveryAnswersStep key={facade.formVersion} loading={facade.loading} questions={facade.state.challenge.questions} onSubmit={facade.verify} />}
      {facade.state.step === "password" && <RecoveryPasswordStep key={facade.formVersion} loading={facade.loading} onSubmit={facade.reset} />}
      {facade.state.step === "success" ? <div className="flex flex-col gap-4">
        <ShieldCheck size={32} className="text-green-700" aria-hidden="true" />
        <p role="status">Senha redefinida com sucesso. Faça um novo login com sua nova senha.</p>
        <Link to="/login" onClick={facade.restart} className="peract-font-color-accent underline focus-visible:outline">Voltar ao login</Link>
      </div> : <div className="mt-6 flex flex-wrap items-center gap-4">
        {facade.state.step !== "email" && <PeractButton theme="secondary" action={facade.restart}>Voltar e reiniciar</PeractButton>}
        <Link to="/login" onClick={facade.restart} className="text-sm underline focus-visible:outline">Cancelar e voltar ao login</Link>
      </div>}
    </PeractCard>
  </main>;
}