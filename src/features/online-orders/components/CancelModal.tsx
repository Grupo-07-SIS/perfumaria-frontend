import type { Venda } from "../../../core/store/AppContext";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { XCircle, Clock } from "lucide-react";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
export function CancelModal({
  venda,
  error,
  isSaving = false,
  onClose,
  onConfirm
}: {
  venda: Venda;
  error?: string;
  isSaving?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
    return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={() => { if (!isSaving) onClose(); }}>
      <fieldset disabled={isSaving} className="contents" aria-busy={isSaving}>
        <div className="p-4 border-b peract-border-color flex items-center gap-2">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <PeractModalTitle className="peract-font-color-default">Cancelar Pedido</PeractModalTitle>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-1">
            Tem certeza que deseja cancelar o pedido{" "}
            <strong className="peract-font-color-default font-mono">{venda.id}</strong>?
          </p>
          <p className="text-xs peract-font-color-muted">
            Cliente:{" "}
            <span className="text-gray-600">
              {venda.cliente || "Não vinculado"}
            </span>{" "}
            · Total:{" "}
            <span className="text-gray-600">
              R$ {venda.total.toFixed(2).replace(".", ",")}
            </span>
          </p>
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <Clock size={11} /> O pedido aparecerá no Histórico de Vendas como
            cancelado.
          </p>
          {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">
            Fechar
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1.5" variant="plain" size="plain">
            <XCircle size={14} /> {isSaving ? "Cancelando..." : "Cancelar pedido"}
          </PeractButtonPrimitive>
        </div>
        </fieldset>
      </PeractModal>;
}
