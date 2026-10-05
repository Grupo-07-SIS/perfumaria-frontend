import type { Venda } from "../../../core/store/AppContext";
import { PeractTag } from "../../../shared/components/peract-tag";
import { ACC } from "../config/sales-history.config";
import { Store, MessageCircle, Globe } from "lucide-react";
export function CanalBadge({
  venda
}: {
  venda: Venda;
}) {
  if (venda.tipoVenda === "presencial") {
    return <PeractTag className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full peract-font-color-accent" style={{
      background: `${ACC}18`
    }}>
        <Store size={10} /> Presencial
      </PeractTag>;
  }
  if (venda.canalOnline === "whatsapp") {
    return <PeractTag className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <MessageCircle size={10} /> WhatsApp
      </PeractTag>;
  }
  return <PeractTag className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
      <Globe size={10} /> Site
    </PeractTag>;
}
