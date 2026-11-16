import { PeractTag } from "../../../shared/components/peract-tag";
import { CheckCircle, Clock } from "lucide-react";
export function StatusBadge({
  finalizado
}: {
  finalizado: boolean;
}) {
  if (finalizado) {
    return <PeractTag className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle size={10} /> Finalizado
      </PeractTag>;
  }
  return <PeractTag className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium peract-bg-accent-soft peract-font-color-accent">
      <Clock size={10} /> Pendente
    </PeractTag>;
}
