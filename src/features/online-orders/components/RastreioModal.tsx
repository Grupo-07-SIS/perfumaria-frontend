import { useRastreioModalForm } from "../facade/useRastreioModalForm";
import type { Venda } from "../../../core/store/AppContext";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { MessageCircle, X, Send } from "lucide-react";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
export function RastreioModal({
  venda,
  error: requestError,
  isSaving = false,
  onClose,
  onConfirm
}: {
  venda: Venda;
  error?: string;
  isSaving?: boolean;
  onClose: () => void;
  onConfirm: (codigo: string) => void;
}) {
  const {
    codigo,
    setCodigo,
    error,
    confirmar
  } = useRastreioModalForm();
    return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={() => { if (!isSaving) onClose(); }}><PeractModalTitle className="sr-only">Detalhes</PeractModalTitle>
      <fieldset disabled={isSaving} className="contents" aria-busy={isSaving}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium peract-font-color-default">
                Código de Rastreio
              </p>
              <p className="text-xs peract-font-color-muted">
                Pedido {venda.id} · WhatsApp
              </p>
            </div>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar">
            <X size={18} />
          </PeractButtonPrimitive>
        </div>
        <PeractField className="p-4">
          <PeractLabel className="block text-xs peract-font-color-muted mb-1.5 font-medium tracking-wide uppercase">
            Código de rastreio (opcional)
          </PeractLabel>
          <PeractInputControl type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: BR123456789BR" maxLength={100} aria-invalid={!!error} className={`w-full border rounded-xl px-3 py-2.5 text-sm peract-font-color-default outline-none focus:border-green-400 transition-colors font-mono ${error ? "border-red-400" : "peract-border-color"}`} autoFocus />
          {error && <p role="alert" className="text-xs text-red-600 mt-1.5">{error}</p>}
          {requestError && <p role="alert" className="text-xs text-red-600 mt-1.5">{requestError}</p>}
        </PeractField>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">
            Cancelar
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={() => confirmar(onConfirm)} className="flex-1 px-4 py-2 rounded-lg text-sm text-white font-medium flex items-center justify-center gap-1.5 hover:opacity-90" style={{
        background: "#22c55e"
      }} variant="plain" size="plain">
            <Send size={14} /> {isSaving ? "Finalizando..." : "Finalizar pedido"}
          </PeractButtonPrimitive>
        </div>
        </fieldset>
      </PeractModal>;
}
