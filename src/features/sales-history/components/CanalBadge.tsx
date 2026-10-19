import type { Venda } from "../../../core/store/AppContext";
import { PeractTag } from "../../../shared/components/peract-tag";
import { Store, MessageCircle, Globe } from "lucide-react";
export function CanalBadge({
  venda,
  neutral = false
}: {
  venda: Venda;
  neutral?: boolean;
}) {
  if (venda.tipoVenda === "presencial") {
    return <PeractTag className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border peract-border-color peract-bg-card peract-font-color-default">
        <Store size={10} /> Presencial
      </PeractTag>;
  }
  if (venda.canalOnline === "whatsapp") {
    return <PeractTag className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 ${neutral ? "rounded-md border peract-border-color peract-bg-card peract-font-color-default" : "rounded-full bg-green-100 text-green-700"}`}>
        <MessageCircle size={10} /> WhatsApp
      </PeractTag>;
  }
  return <PeractTag className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 ${neutral ? "rounded-md border peract-border-color peract-bg-card peract-font-color-default" : "rounded-full bg-blue-100 text-blue-600"}`}>
      <Globe size={10} /> Site
    </PeractTag>;
}
