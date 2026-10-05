import { apiClient } from "../../../core/services/http-client";
import { useApp } from "../../../core/store/AppContext";

export interface SaleResponseDto {
  canalVendaOnline?: "WHATSAPP" | "SITE" | null;
  clienteNome?: string | null;
  dataHora?: string | null;
  dataVenda?: string | null;
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
  quantidade: number;
  tipoItem?: "PRODUTO" | "DECANT" | "BODY_SPLASH_FRACIONADO" | null;
  valorUnitario: number;
  volumeMl?: number | null;
}

interface SalesPageDto {
  content: SaleResponseDto[];
  totalPages?: number;
}

type SalesListResponse = SaleResponseDto[] | SalesPageDto;

const paymentLabels: Record<string, string> = {
  CARTAO_CREDITO: "Cartão de crédito",
  CARTAO_DEBITO: "Cartão de débito",
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  TRANSFERENCIA_BANCARIA: "Transferência bancária",
};

function normalizedPayment(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function paymentLabel(value?: string | null) {
  if (!value) return "";
  const normalized = normalizedPayment(value);
  const compact = normalized.replace("_DE_", "_");
  return paymentLabels[normalized] ?? paymentLabels[compact] ?? value;
}

function formatSaleDate(dataHora?: string | null, dataVenda?: string | null) {
  const value = dataHora || dataVenda;
  if (!value) return "";

  const [datePart, timePart] = value.split("T");
  const datePieces = datePart.split("-");
  if (datePieces.length !== 3) return value;

  const formattedDate = `${datePieces[2]}/${datePieces[1]}/${datePieces[0]}`;
  return timePart ? `${formattedDate} ${timePart.slice(0, 5)}` : formattedDate;
}

function toVenda(dto: SaleResponseDto) {
  return {
    id: `V-${dto.id}`,
    data: formatSaleDate(dto.dataHora, dto.dataVenda),
    cliente: dto.clienteNome ?? "",
    pagamento: paymentLabel(dto.forma),
    total: dto.valorFinal ?? dto.valorTotal ?? dto.subtotal ?? 0,
    tipoVenda: dto.tipoVenda === "PRESENCIAL" ? "presencial" as const : "online" as const,
    canalOnline: dto.canalVendaOnline?.toLowerCase() as "whatsapp" | "site" | undefined,
    frete: dto.frete ?? undefined,
    desconto: dto.desconto ?? undefined,
    itens: (dto.itens ?? []).map((item) => ({
      nome: item.produtoNome,
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
  async listSales() {
    const sales = new Map<number, SaleResponseDto>();
    let page = 0;
    let hasMore = true;
    const size = 100;

    while (hasMore) {
      const { data } = await apiClient.get<SalesListResponse>("/vendas", { params: { page, size } });
      const content = Array.isArray(data) ? data : data.content;
      const previousCount = sales.size;
      content.forEach((sale) => sales.set(sale.id, sale));
      hasMore = Array.isArray(data)
        ? content.length === size && sales.size > previousCount
        : page + 1 < (data.totalPages ?? 1);
      page += 1;
    }

    return [...sales.values()].map(toVenda);
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
    const tipoPagamento = normalizedPayment(venda.pagamento)
      .replace("CARTAO_DE_CREDITO", "CARTAO_CREDITO")
      .replace("CARTAO_DE_DEBITO", "CARTAO_DEBITO");
    const { data } = await apiClient.patch<SaleResponseDto>(`/vendas/${getNumericSaleId(venda.id)}`, {
      status,
      tipoPagamento,
    });
    return toVenda(data);
  },
};

export function useSalesHistoryRepository() {
  const { currentUser } = useApp();
  return { currentUser };
}
