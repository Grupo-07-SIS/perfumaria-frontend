import { Clock, CheckCircle, XCircle } from "lucide-react";
export const saleStatusConfig: Record<"Pendente" | "Finalizado" | "Cancelado", {
  active: string;
  base: string;
  icon: React.ReactNode;
}> = {
  Pendente: {
    active: "border-amber-400 text-amber-700 bg-amber-50",
    base: "border-gray-200 text-gray-500 hover:border-gray-300",
    icon: <Clock size={13} />
  },
  Finalizado: {
    active: "border-green-500 text-green-700 bg-green-50",
    base: "border-gray-200 text-gray-500 hover:border-gray-300",
    icon: <CheckCircle size={13} />
  },
  Cancelado: {
    active: "border-red-400 text-red-600 bg-red-50",
    base: "border-gray-200 text-gray-500 hover:border-gray-300",
    icon: <XCircle size={13} />
  }
};
