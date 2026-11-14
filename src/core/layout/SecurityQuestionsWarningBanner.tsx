import { Link } from "react-router";
import { ShieldAlert, X } from "lucide-react";
import { useApp } from "../../app/context/AppContext";
import { environment } from "../../environment";
import { PeractButton } from "../../shared/components/peract-button";

export function SecurityQuestionsWarningBanner() {
  const { securityQuestions, dismissSecurityQuestionsWarning } = useApp();
  if (!environment.features.securityQuestionsEnabled || !securityQuestions?.warningVisible) return null;
  return (
    <section aria-label="Segurança da conta" className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <ShieldAlert size={20} className="shrink-0" aria-hidden="true" />
        <div className="flex-1" role="status">
          <p>{securityQuestions.complete ? "Perguntas cadastradas. Sua recuperação de acesso está configurada." : securityQuestions.complete === null ? "Confira a segurança da sua conta. O status das perguntas ainda não pôde ser confirmado." : "Cadastre três perguntas de segurança para poder recuperar sua senha. O cadastro é opcional."}</p>
          <Link className="mt-1 inline-block underline font-medium focus-visible:outline" to="/configuracoes?secao=seguranca">{securityQuestions.complete ? "Gerenciar segurança" : "Cadastrar perguntas de segurança"}</Link>
        </div>
        <PeractButton aria-label="Fechar aviso de segurança" action={dismissSecurityQuestionsWarning} theme="secondary" size="icon"><X size={18} /></PeractButton>
      </div>
    </section>
  );
}