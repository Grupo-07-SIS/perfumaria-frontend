import { saleStatusConfig } from "../config/sales-history.presentation";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { EditModalFormValues } from "../models/sales-history.models";
import type { Venda } from "../../../core/store/AppContext";
export function useEditModalForm({
  venda,
  onSave
}: {
  venda: Venda;
  onSave: (v: Venda) => void;
}) {
  const initialStatus: "Pendente" | "Finalizado" | "Cancelado" = venda.cancelada ? "Cancelado" : venda.tipoVenda === "presencial" || venda.enviado ? "Finalizado" : "Pendente";
  const form = useForm<EditModalFormValues>({
    defaultValues: {
      pagamento: venda.pagamento,
      novoStatus: initialStatus
    }
  });
  const {
    pagamento,
    novoStatus
  } = form.watch();
  const setPagamento = (value: SetStateAction<EditModalFormValues["pagamento"]>) => form.setValue("pagamento", typeof value === "function" ? value(form.getValues("pagamento")) : value, {
    shouldDirty: true
  });
  const setNovoStatus = (value: SetStateAction<EditModalFormValues["novoStatus"]>) => form.setValue("novoStatus", typeof value === "function" ? value(form.getValues("novoStatus")) : value, {
    shouldDirty: true
  });

  // Presencial só pode ser Finalizado ou Cancelado
  const statusOpcoes: Array<"Pendente" | "Finalizado" | "Cancelado"> = venda.tipoVenda === "online" ? ["Pendente", "Finalizado", "Cancelado"] : ["Finalizado", "Cancelado"];
  const statusCfg = saleStatusConfig;
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
  return {
    pagamento,
    novoStatus,
    setPagamento,
    setNovoStatus,
    statusOpcoes,
    statusCfg,
    handleSave
  };
}
