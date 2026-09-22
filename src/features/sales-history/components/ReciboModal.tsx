import type { Venda } from "../../../core/store/AppContext";
import { getVendaStatus } from "../services/sales-history.service";
import { PeractModal } from "../../../shared/components/peract-modal";
import { PeractModalTitle } from "../../../shared/components/peract-modal";
import { StatusBadge } from "./StatusBadge";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { X } from "lucide-react";
import { WARM, ACC } from "../config/sales-history.config";
import { Store } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Globe } from "lucide-react";
import { Tag } from "lucide-react";
import { Truck } from "lucide-react";

export function ReciboModal({
  venda,
  onClose
}: {
  venda: Venda;
  onClose: () => void;
}) {
  const status = getVendaStatus(venda);
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-md max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <div>
            <div className="flex items-center gap-2">
              <PeractModalTitle className="peract-font-color-default">Recibo da Venda</PeractModalTitle>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs peract-font-color-muted mt-0.5">{venda.id} · {venda.data}</p>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm" style={{
        background: venda.tipoVenda === "presencial" ? WARM : venda.canalOnline === "whatsapp" ? "#f0fdf4" : "#EFF6FF"
      }}>
            {venda.tipoVenda === "presencial" ? <Store size={14} className="peract-font-color-accent" /> : venda.canalOnline === "whatsapp" ? <MessageCircle size={14} className="text-green-600" /> : <Globe size={14} className="text-blue-600" />}
            <span className="text-xs font-medium" style={{
          color: venda.tipoVenda === "presencial" ? ACC : venda.canalOnline === "whatsapp" ? "#16a34a" : "#2563eb"
        }}>
              {venda.tipoVenda === "presencial" ? "Venda Presencial" : venda.canalOnline === "whatsapp" ? "Venda WhatsApp" : "Venda pelo Site"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg peract-bg-accent-soft">
              <p className="text-xs peract-font-color-muted mb-0.5">Cliente</p>
              <p className="text-sm font-medium peract-font-color-default">{venda.cliente || "Não vinculado"}</p>
            </div>
            <div className="p-3 rounded-lg peract-bg-accent-soft">
              <p className="text-xs peract-font-color-muted mb-0.5">Pagamento</p>
              <p className="text-sm font-medium peract-font-color-default">{venda.pagamento}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs peract-font-color-muted font-medium mb-2 uppercase tracking-wide">Itens comprados</p>
            <div className="border peract-border-color rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs peract-font-color-muted border-b border-gray-50" style={{
            background: "#F9F9F9"
          }}>
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qtd.</div>
                <div className="col-span-2 text-right">Unit.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {venda.itens.filter(i => i.quantidade > 0).map((item, idx) => <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="col-span-6">
                    <p className="text-xs font-medium peract-font-color-default leading-tight">{item.nome}</p>
                    {item.volume && <span className="text-xs peract-font-color-muted">{item.volume}</span>}
                  </div>
                  <div className="col-span-2 text-xs text-gray-600 text-center">{item.quantidade}</div>
                  <div className="col-span-2 text-xs text-gray-600 text-right">R${item.valorUnitario.toFixed(2)}</div>
                  <div className="col-span-2 text-xs font-medium text-right peract-font-color-default">
                    R${(item.valorUnitario * item.quantidade).toFixed(2)}
                  </div>
                </div>)}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 py-3 border-t peract-border-color">
            {venda.desconto !== undefined && venda.desconto > 0 && <div className="flex items-center justify-between text-sm text-green-600">
                <span className="flex items-center gap-1"><Tag size={12} /> Desconto</span>
                <span>- R$ {venda.desconto.toFixed(2).replace(".", ",")}</span>
              </div>}
            {venda.tipoVenda === "online" && venda.frete !== undefined && venda.frete > 0 && <>
                <div className="flex items-center justify-between text-sm peract-font-color-muted">
                  <span>Subtotal</span>
                  <span>R$ {(venda.total - venda.frete + (venda.desconto ?? 0)).toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex items-center justify-between text-sm peract-font-color-muted">
                  <span className="flex items-center gap-1.5"><Truck size={13} className="text-blue-400" /> Frete</span>
                  <span>R$ {venda.frete.toFixed(2).replace(".", ",")}</span>
                </div>
              </>}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total da venda</span>
              <span className="text-lg font-semibold peract-font-color-accent">
                R$ {venda.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="w-full px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            Fechar
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
