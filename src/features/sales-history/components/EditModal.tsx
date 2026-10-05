import { useEditModalForm } from "../facade/useEditModalForm";
import type { Venda } from "../../../core/store/AppContext";
import { Clock, CheckCircle, XCircle, X, ChevronDown } from "lucide-react";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { CanalBadge } from "./CanalBadge";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
import { ACC, pagamentosOpcoes } from "../config/sales-history.config";
export function EditModal({
  venda,
  onClose,
  onSave
}: {
  venda: Venda;
  onClose: () => void;
  onSave: (v: Venda) => void;
}) {
  const {
    pagamento,
    novoStatus,
    setPagamento,
    setNovoStatus,
    statusOpcoes,
    statusCfg,
    handleSave
  } = useEditModalForm({
    venda,
    onSave
  });
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-md max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <div>
            <PeractModalTitle className="peract-font-color-default">Editar Venda</PeractModalTitle>
            <p className="text-xs peract-font-color-muted mt-0.5">{venda.id} · {venda.data}</p>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>

        <div className="p-4 flex flex-col gap-5">
          {/* ── Dados exibidos (read-only) ── */}
          <div className="rounded-xl border peract-border-color overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-50" style={{
          background: "#fafaf9"
        }}>
              <p className="text-xs font-medium peract-font-color-muted uppercase tracking-wide">Dados da venda</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              {/* Canal — fixo, não editável */}
              <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                <p className="text-xs peract-font-color-muted mb-1">Canal</p>
                <div className="flex items-center gap-1.5">
                  <CanalBadge venda={venda} />
                </div>
              </div>
              {/* Cliente */}
              <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                <p className="text-xs peract-font-color-muted mb-1">Cliente</p>
                <p className="text-sm font-medium peract-font-color-default truncate">{venda.cliente || "—"}</p>
              </div>
              {/* Total */}
              <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                <p className="text-xs peract-font-color-muted mb-1">Valor total</p>
                <p className="text-sm font-medium peract-font-color-default">R$ {venda.total.toFixed(2).replace(".", ",")}</p>
              </div>
              {/* Frete */}
              {venda.tipoVenda === "online" && <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                  <p className="text-xs peract-font-color-muted mb-1">Frete</p>
                  <p className="text-sm text-gray-700">
                    {venda.frete ? `R$ ${venda.frete.toFixed(2).replace(".", ",")}` : "—"}
                  </p>
                </div>}
              {/* Desconto */}
              {venda.desconto != null && venda.desconto > 0 && <div className="p-2.5 rounded-lg bg-green-50">
                  <p className="text-xs peract-font-color-muted mb-1">Desconto aplicado</p>
                  <p className="text-sm font-medium text-green-700">- R$ {venda.desconto.toFixed(2).replace(".", ",")}</p>
                </div>}
            </div>

            {/* Itens (read-only) */}
            <div className="border-t border-gray-50">
              <div className="px-3 py-2 border-b border-gray-50" style={{
            background: "#fafaf9"
          }}>
                <p className="text-xs peract-font-color-muted">Itens da venda</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-36 overflow-y-auto">
                {venda.itens.filter(i => i.quantidade > 0).map((item, idx) => <div key={idx} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-xs text-gray-700">{item.nome} {item.volume && <span className="peract-font-color-muted">({item.volume})</span>}</p>
                      <p className="text-xs peract-font-color-muted">×{item.quantidade}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-600">R$ {(item.valorUnitario * item.quantidade).toFixed(2)}</span>
                  </div>)}
              </div>
            </div>
          </div>

          {/* ── Campos editáveis ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-gray-100" />
              <p className="text-xs peract-font-color-muted uppercase tracking-wide">Campos editáveis</p>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Status */}
            <div>
              <PeractLabel className="text-xs peract-font-color-muted block mb-2">Status da venda *</PeractLabel>
              <div className="flex gap-2">
                {statusOpcoes.map(s => <PeractButtonPrimitive key={s} onClick={() => setNovoStatus(s)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all flex-1 justify-center ${novoStatus === s ? statusCfg[s].active : statusCfg[s].base}`} variant="plain" size="plain">
                    {statusCfg[s].icon} {s}
                  </PeractButtonPrimitive>)}
              </div>
              {novoStatus === "Pendente" && <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <Clock size={11} /> Este pedido voltará para Pedidos Online como pendente.
                </p>}
              {novoStatus === "Cancelado" && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <XCircle size={11} /> A venda será marcada como cancelada.
                </p>}
            </div>

            {/* Pagamento */}
            <PeractField>
              <PeractLabel className="text-xs peract-font-color-muted block mb-1.5">Tipo de pagamento *</PeractLabel>
              <div className="relative">
                <PeractNativeSelect value={pagamento} onChange={e => setPagamento(e.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none appearance-none pr-8" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
                  <option value="">Selecionar...</option>
                  {pagamentosOpcoes.map(p => <option key={p} value={p}>{p}</option>)}
                </PeractNativeSelect>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 peract-font-color-muted pointer-events-none" />
              </div>
            </PeractField>
          </div>
        </div>

        <div className="p-4 border-t peract-border-color flex gap-2">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm border peract-border-color text-gray-600 hover:bg-gray-50 transition-colors" variant="plain" size="plain">Fechar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 flex items-center justify-center gap-2 peract-bg-accent" variant="plain" size="plain">
            <CheckCircle size={15} /> Salvar alterações
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
