import { Clock } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { XCircle } from "lucide-react";

export function StatusBadge({
  status
}: {
  status: "Pendente" | "Finalizado" | "Cancelado";
}) {
  const cfg = {
    Pendente: {
      cls: "bg-amber-100 text-amber-700",
      icon: <Clock size={10} />
    },
    Finalizado: {
      cls: "bg-green-100 text-green-700",
      icon: <CheckCircle size={10} />
    },
    Cancelado: {
      cls: "bg-red-100 text-red-600",
      icon: <XCircle size={10} />
    }
  };
  const {
    cls,
    icon
  } = cfg[status];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {icon} {status}
    </span>;
}
