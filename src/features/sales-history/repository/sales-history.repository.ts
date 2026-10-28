import { apiClient } from "../../../core/services/http-client";
import { useApp } from "../../../core/store/AppContext";
import type { Venda } from "../../../core/store/AppContext";
import { formatPaymentLabel } from "../../../shared/utils/payment";
import type { SalesHistoryQuery, SalesHistorySummary } from "../models/sales-history.models";

export interface SalesHistoryPage {
  items: Venda[];
  totalItems: number;
  totalPages: number;
}

export interface SaleResponseDto {
  canalVendaOnline?: "WHATSAPP" | "SITE" | null;
  clienteNome?: string | null;
  codigoRastreio?: string | null;
  dataHoraVenda: string;
  desconto?: number | null;
  frete?: number | null;
  forma?: string | null;
  id: number;
  itens?: SaleItemResponseDto[] | null;
  status: "PENDENTE" | "FINALIZADA" | "CANCELADA";
  subtotal?: number | null;
  tipoVenda: "PRESENCIAL" | "ONLINE";
  valorFinal?: number | null;
  valorTotal?: number | null;
}

export interface SaleItemResponseDto {
  produtoNome: string;
  categoriaNome?: string | null;
  quantidade: number;
  tipoItem?: "PRODUTO" | "DECANT" | "BODY_SPLASH_FRACIONADO" | null;
  valorUnitario: number;
  volumeMl?: number | null;
}

interface SalesPageDto {
  content: SaleResponseDto[];
  totalElements?: number;
  totalPages?: number;
}

type SalesListResponse = SaleResponseDto[] | SalesPageDto;

interface SalesSummaryDto {
  vendasFinalizadas?: number | null;
  vendasCanceladas?: number | null;
  faturamentoTotal?: number | null;
}

function normalizedPayment(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function toPaymentCode(label: string) {
  return normalizedPayment(label)
    .replace("CARTAO_DE_CREDITO", "CARTAO_CREDITO")
    .replace("CARTAO_DE_DEBITO", "CARTAO_DEBITO");
}

function toListParams({ page, size, search, pagamento, tipo, status }: SalesHistoryQuery) {
  const params: Record<string, string | number | boolean> = { page: Math.max(0, page - 1), size, excluirPendentes: true };
  const busca = search.trim();
  if (busca) params.busca = busca;
  if (pagamento !== "todos") params.formaPagamento = toPaymentCode(pagamento);
  if (tipo !== "todos") params.tipoVenda = tipo.toUpperCase();
  if (status === "finalizado") params.vendaFinalizada = true;
  if (status === "cancelado") params.vendaCancelada = true;
  return params;
}

function formatSaleDate(dataHoraVenda: string) {
  const value = dataHoraVenda;
  if (!value) return "";

  const [datePart, timePart] = value.split(/[T ]/);
  const datePieces = datePart.split("-");
  if (datePieces.length !== 3) return value;

  const formattedDate = `${datePieces[2]}/${datePieces[1]}/${datePieces[0]}`;
  return timePart ? `${formattedDate} ${timePart.slice(0, 5)}` : formattedDate;
}

function toVenda(dto: SaleResponseDto) {
  return {
    id: `V-${dto.id}`,
    data: formatSaleDate(dto.dataHoraVenda),
    cliente: dto.clienteNome ?? "",
    codigoRastreio: dto.codigoRastreio ?? undefined,
    pagamento: formatPaymentLabel(dto.forma),
    total: dto.valorFinal ?? dto.valorTotal ?? dto.subtotal ?? 0,
    tipoVenda: dto.tipoVenda === "PRESENCIAL" ? "presencial" as const : "online" as const,
    canalOnline: dto.canalVendaOnline?.toLowerCase() as "whatsapp" | "site" | undefined,
    frete: dto.frete ?? undefined,
    desconto: dto.desconto ?? undefined,
    itens: (dto.itens ?? []).map((item) => ({
      nome: item.produtoNome,
      categoria: item.categoriaNome ?? undefined,
      volume: item.volumeMl ? `${item.volumeMl}ml` : undefined,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      tipoItem: item.tipoItem ?? undefined,
    })),
    cancelada: dto.status === "CANCELADA",
    enviado: dto.status === "FINALIZADA",
  };
}

function getNumericSaleId(id: string) {
  const numericId = Number(id.replace(/^V-/i, ""));
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("SALES_HISTORY_INVALID_ID");
  }
  return numericId;
}

export const salesHistoryRepository = {
  async listSales(query: SalesHistoryQuery): Promise<SalesHistoryPage> {
    const { data } = await apiClient.get<SalesListResponse>("/vendas", { params: toListParams(query) });
    if (Array.isArray(data)) {
      return { items: data.map(toVenda), totalItems: data.length, totalPages: 1 };
    }
    const totalItems = data.totalElements ?? data.content.length;
    return {
      items: data.content.map(toVenda),
      totalItems,
      totalPages: Math.max(1, data.totalPages ?? Math.ceil(totalItems / query.size)),
    };
  },

  async getSummary(): Promise<SalesHistorySummary> {
    const { data } = await apiClient.get<SalesSummaryDto>("/vendas/resumo");
    const finalizadas = data.vendasFinalizadas ?? 0;
    const canceladas = data.vendasCanceladas ?? 0;
    return {
      totalVendas: finalizadas + canceladas,
      finalizadas,
      canceladas,
      faturamento: data.faturamentoTotal ?? 0,
    };
  },

  async getSaleDetails(id: string) {
    const { data } = await apiClient.get<SaleResponseDto>(`/vendas/${getNumericSaleId(id)}`);
    return toVenda(data);
  },

  async updateSale(venda: import("../../../core/store/AppContext").Venda) {
    const status = venda.cancelada
      ? "CANCELADA"
      : venda.tipoVenda === "presencial" || venda.enviado
        ? "FINALIZADA"
        : "PENDENTE";
    const tipoPagamento = toPaymentCode(venda.pagamento);
    const canHaveTracking = venda.tipoVenda === "online" && venda.canalOnline === "whatsapp";
    const trackingCode = venda.codigoRastreio?.trim();
    const clearWhatsappTracking = canHaveTracking && (status !== "FINALIZADA" || trackingCode === "");
    if (clearWhatsappTracking) {
      await apiClient.delete<void>(`/vendas/${getNumericSaleId(venda.id)}/codigo-rastreio`);
    }
    const { data } = await apiClient.patch<SaleResponseDto>(`/vendas/${getNumericSaleId(venda.id)}`, {
      status,
      tipoPagamento,
      ...(canHaveTracking && status === "FINALIZADA" && trackingCode ? { codigoRastreio: trackingCode } : {}),
    });
    return {
      ...toVenda(data),
      ...(clearWhatsappTracking ? { codigoRastreio: undefined } : {}),
    };
  },
};

export function useSalesHistoryRepository() {
  const { currentUser } = useApp();
  return { currentUser };
}
