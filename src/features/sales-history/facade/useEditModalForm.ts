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
      codigoRastreio: venda.codigoRastreio ?? "",
      novoStatus: initialStatus
    }
  });
  const {
    pagamento,
    codigoRastreio,
    novoStatus
  } = form.watch();
  const setPagamento = (value: SetStateAction<EditModalFormValues["pagamento"]>) => form.setValue("pagamento", typeof value === "function" ? value(form.getValues("pagamento")) : value, {
    shouldDirty: true
  });
  const setNovoStatus = (value: SetStateAction<EditModalFormValues["novoStatus"]>) => form.setValue("novoStatus", typeof value === "function" ? value(form.getValues("novoStatus")) : value, {
    shouldDirty: true
  });
  const canEditTracking = venda.tipoVenda === "online" && venda.canalOnline === "whatsapp";
  const setCodigoRastreio = (value: string) => {
    form.setValue("codigoRastreio", value, { shouldDirty: true });
    form.clearErrors("codigoRastreio");
  };

  // Presencial só pode ser Finalizado ou Cancelado
  const statusOpcoes: Array<"Pendente" | "Finalizado" | "Cancelado"> = venda.tipoVenda === "online" ? ["Pendente", "Finalizado", "Cancelado"] : ["Finalizado", "Cancelado"];
  const statusCfg = saleStatusConfig;
  const handleSave = () => {
    const cancelada = novoStatus === "Cancelado";
    const enviado = venda.tipoVenda === "online" ? novoStatus === "Finalizado" : false;
    const codigo = codigoRastreio.trim();
    if (canEditTracking && enviado && codigo.length > 100) {
      form.setError("codigoRastreio", { type: "maxLength", message: "Máximo de 100 caracteres." });
      return;
    }
    onSave({
      ...venda,
      pagamento,
      codigoRastreio: canEditTracking && enviado ? codigo || (venda.codigoRastreio ? "" : undefined) : undefined,
      cancelada,
      enviado
    });
  };
  return {
    pagamento,
    codigoRastreio,
    setCodigoRastreio,
    canEditTracking,
    trackingError: form.formState.errors.codigoRastreio?.message,
    novoStatus,
    setPagamento,
    setNovoStatus,
    statusOpcoes,
    statusCfg,
    handleSave
  };
}
