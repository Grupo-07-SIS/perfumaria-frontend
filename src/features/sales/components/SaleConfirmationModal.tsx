import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { PeractBadge } from "../../../shared/components/peract-badge";
import type { SaleReview } from "../models/sales.models";

interface SaleConfirmationModalProps {
  review: SaleReview;
  totals: { subtotal: number; descontoAplicado: number; freteVal: number; total: number };
  saving: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const currency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function SaleConfirmationModal({ review, totals, saving, error, onClose, onConfirm }: SaleConfirmationModalProps) {
  return <PeractModal onClose={onClose} className="w-full max-w-xl max-h-[90dvh] flex flex-col peract-radius-lg" onEscapeKeyDown={event => { if (saving) event.preventDefault(); }} onPointerDownOutside={event => { if (saving) event.preventDefault(); }}>
    <div className="flex items-center justify-between gap-3 p-4 border-b peract-border-color">
      <PeractModalTitle>Confirmar venda</PeractModalTitle>
      <PeractButtonPrimitive onClick={onClose} disabled={saving} variant="plain" size="plain" aria-label="Fechar resumo da venda" title="Fechar resumo" className="p-1 peract-font-color-muted"><X size={18} /></PeractButtonPrimitive>
    </div>
    <div className="p-4 overflow-y-auto min-h-0 flex flex-col gap-4">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="min-w-0"><dt className="text-xs peract-font-color-muted">Cliente</dt><dd className="font-medium break-words">{review.customer.nome}</dd><dd className="text-xs peract-font-color-muted break-words">{review.customer.telefone}</dd></div>
        <div><dt className="text-xs peract-font-color-muted">Pagamento</dt><dd>{review.form.pagamento}</dd></div>
        <div><dt className="text-xs peract-font-color-muted">Canal</dt><dd>{review.form.isOnline ? `Online - ${review.form.canalOnline === "whatsapp" ? "WhatsApp" : "Site"}` : "Presencial"}</dd></div>
      </dl>
      <ul className="divide-y peract-border-color border-y peract-border-color">
        {review.cart.map(item => <li key={item.catalogItem.id} className="py-3 flex items-start justify-between gap-3 text-sm">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-medium break-words">{item.catalogItem.nomeExibicao ?? item.catalogItem.nome}</span>{item.catalogItem.volumetria && <PeractBadge variant="secondary">{item.catalogItem.volumetria}</PeractBadge>}</div>
            <p className="text-xs peract-font-color-muted">{item.catalogItem.apresentacao ?? item.catalogItem.categoriaNome ?? "Produto completo"}</p>
            <p className="text-xs peract-font-color-muted mt-1">{item.quantidade} x {currency(item.catalogItem.preco)}</p>
          </div>
          <span className="shrink-0 font-medium">{currency(item.catalogItem.preco * item.quantidade)}</span>
        </li>)}
      </ul>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3"><dt>Subtotal</dt><dd>{currency(totals.subtotal)}</dd></div>
        {totals.descontoAplicado > 0 && <div className="flex justify-between gap-3 text-green-700"><dt>Desconto{review.form.tipoDesconto === "percentual" ? ` (${review.form.desconto}%)` : ""}</dt><dd>- {currency(totals.descontoAplicado)}</dd></div>}
        {review.form.isOnline && <div className="flex justify-between gap-3"><dt>Frete</dt><dd>{currency(totals.freteVal)}</dd></div>}
        <div className="flex justify-between gap-3 border-t peract-border-color pt-2 font-medium"><dt>Total</dt><dd>{currency(totals.total)}</dd></div>
      </dl>
    </div>
    <div className="p-4 border-t peract-border-color grid grid-cols-1 sm:grid-cols-2 gap-2">
      <PeractButtonPrimitive onClick={onClose} disabled={saving} variant="plain" size="plain" className="flex items-center justify-center gap-2 border peract-border-color rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"><ArrowLeft size={16} /> Voltar para alterar</PeractButtonPrimitive>
      <PeractButtonPrimitive onClick={onConfirm} disabled={saving} variant="plain" size="plain" className="flex items-center justify-center gap-2 peract-bg-accent text-white rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"><CheckCircle size={16} /> {saving ? "Registrando..." : "Confirmar registro"}</PeractButtonPrimitive>
    </div>
  </PeractModal>;
}