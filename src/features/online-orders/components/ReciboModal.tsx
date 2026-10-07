import type { Venda } from "../../../core/store/AppContext";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { StatusBadge } from "./StatusBadge";
import { CanalBadge } from "./CanalBadge";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { X, Truck, CheckCircle, Package } from "lucide-react";
export function ReciboModal({
  venda,
  onClose
}: {
  venda: Venda;
  onClose: () => void;
}) {
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-md max-h-[85vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <PeractModalTitle className="peract-font-color-default">Pedido Online</PeractModalTitle>
              <StatusBadge finalizado={!!venda.enviado} />
              <CanalBadge canal={venda.canalOnline} />
            </div>
            <p className="text-xs peract-font-color-muted mt-0.5">
              {venda.id} · {venda.data}
            </p>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar">
            <X size={18} />
          </PeractButtonPrimitive>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg peract-bg-accent-soft min-w-0">
              <p className="text-xs peract-font-color-muted mb-0.5">Cliente</p>
              <p className="text-sm font-medium peract-font-color-default">
                {venda.cliente || "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg peract-bg-accent-soft min-w-0">
              <p className="text-xs peract-font-color-muted mb-0.5">Pagamento</p>
              <p className="text-sm font-medium peract-font-color-default">
                {venda.pagamento}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs peract-font-color-muted font-medium mb-2 uppercase tracking-wide">
              Itens
            </p>
            <div className="border peract-border-color rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs peract-font-color-muted border-b border-gray-50" style={{
            background: "#fafaf9"
          }}>
                <div className="col-span-6 min-w-0">Item</div>
                <div className="col-span-2 text-center">Qtd.</div>
                <div className="col-span-2 text-right">Unit.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {venda.itens.filter(i => i.quantidade > 0).map((item, idx) => <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="col-span-6 min-w-0">
                      <p className="text-xs font-medium peract-font-color-default leading-tight">
                        {item.nome}
                      </p>
                      {item.volume && <span className="text-xs peract-font-color-muted">
                          {item.volume}
                        </span>}
                    </div>
                    <div className="col-span-2 text-xs text-gray-600 text-center">
                      {item.quantidade}
                    </div>
                    <div className="col-span-2 text-xs text-gray-600 text-right">
                      R${item.valorUnitario.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-xs font-medium text-right peract-font-color-default">
                      R${(item.valorUnitario * item.quantidade).toFixed(2)}
                    </div>
                  </div>)}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 py-3 border-t peract-border-color">
            {venda.frete !== undefined && venda.frete > 0 && <>
                <div className="flex items-center justify-between text-sm peract-font-color-muted">
                  <span>Subtotal</span>
                  <span>
                    R${" "}
                    {(venda.total - venda.frete).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-blue-500">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} /> Frete
                  </span>
                  <span>R$ {venda.frete.toFixed(2).replace(".", ",")}</span>
                </div>
              </>}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-lg font-semibold peract-font-color-accent">
                R$ {venda.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          {venda.enviado && venda.dataEnvio && <div className="mt-3 flex flex-col gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} /> Finalizado em {venda.dataEnvio}
              </div>
              {venda.codigoRastreio && <div className="flex items-center gap-2 mt-0.5">
                  <Package size={13} className="shrink-0" /><span className="min-w-0 break-all">
                    Rastreio:{" "}
                    <span className="font-mono font-medium">
                      {venda.codigoRastreio}
                    </span>
                  </span>
                </div>}
            </div>}
        </div>

        <div className="p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="w-full px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            Fechar
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
