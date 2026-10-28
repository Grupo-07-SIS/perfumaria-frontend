import type { Venda } from "../../../core/store/AppContext";
import axios from "axios";

export function saleUpdateErrorMessage(error: unknown, reactivating: boolean): string {
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    const message = (error.response.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string" && /estoque insuficiente/i.test(message)) {
      return reactivating
        ? "Não foi possível reativar a venda: um ou mais produtos estão sem estoque ou com quantidade insuficiente. A venda permanece cancelada."
        : "Não foi possível atualizar a venda: estoque insuficiente para os produtos selecionados.";
    }
  }
  return "Não foi possível atualizar a venda.";
}

export function getVendaStatus(v: Venda): "Pendente" | "Finalizado" | "Cancelado" {
  if (v.cancelada) return "Cancelado";
  if (v.tipoVenda === "presencial" || v.enviado) return "Finalizado";
  return "Pendente";
}
