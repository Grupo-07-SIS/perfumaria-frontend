import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { EditModalFormValues } from "../models/sales-history.models";
import type { Venda } from "../../../core/store/AppContext";
import { Clock } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { XCircle } from "lucide-react";

export function useEditModalForm({
  venda,
  onClose,
  onSave
}: {
  venda: Venda;
  onClose: () => void;
  onSave: (v: Venda) => void;
}) {

const initialStatus: "Pendente" | "Finalizado" | "Cancelado" = venda.cancelada ? "Cancelado" : venda.tipoVenda === "presencial" || venda.enviado ? "Finalizado" : "Pendente";
const form = useForm<EditModalFormValues>({ defaultValues: {
pagamento: venda.pagamento,
novoStatus: initialStatus,
} });
const { pagamento, novoStatus } = form.watch();
const setPagamento = (value: SetStateAction<EditModalFormValues["pagamento"]>) => form.setValue("pagamento", typeof value === "function" ? value(form.getValues("pagamento")) : value, { shouldDirty: true });
const setNovoStatus = (value: SetStateAction<EditModalFormValues["novoStatus"]>) => form.setValue("novoStatus", typeof value === "function" ? value(form.getValues("novoStatus")) : value, { shouldDirty: true });


  // Presencial só pode ser Finalizado ou Cancelado
  const statusOpcoes: Array<"Pendente" | "Finalizado" | "Cancelado"> = venda.tipoVenda === "online" ? ["Pendente", "Finalizado", "Cancelado"] : ["Finalizado", "Cancelado"];
  const statusCfg: Record<"Pendente" | "Finalizado" | "Cancelado", {
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
  const handleSave = () => {
    const cancelada = novoStatus === "Cancelado";
    const enviado = venda.tipoVenda === "online" ? novoStatus === "Finalizado" : false;
    onSave({
      ...venda,
      pagamento,
      cancelada,
      enviado
    });
  };
  
return { pagamento, novoStatus, setPagamento, setNovoStatus, statusOpcoes, statusCfg, handleSave };
}
