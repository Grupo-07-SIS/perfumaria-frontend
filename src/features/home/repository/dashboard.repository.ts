import { apiClient } from "../../../core/services/http-client";
import { formatPaymentLabel } from "../../../shared/utils/payment";
import type {
  CategoryDistributionResponseDto,
  CriticalStockResponseDto,
  DashboardData,
  DashboardPeriodData,
  TopProductsResponseDto,
  DashboardKpisResponseDto,
  DashboardRecentSalesResponseDto,
  DashboardTimeSeriesResponseDto,
  DashboardSalesByChannelResponseDto,
} from "./dto/dashboard.dto";
import type { Period } from "../models/home.models";

export function getDashboardPeriodData(period: Period, currentDate = new Date()): DashboardPeriodData {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(currentDate);
  const parts = Object.fromEntries(dateParts.map(part => [part.type, part.value]));
  const endDate = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  const startDate = new Date(endDate);
  if (period === "diario") {
    // Start and end dates are identical.
  } else if (period === "7dias") {
    startDate.setUTCDate(startDate.getUTCDate() - 6);
  } else if (period === "30dias") {
    startDate.setUTCDate(startDate.getUTCDate() - 29);
  } else {
    startDate.setUTCDate(1);
    startDate.setUTCMonth(startDate.getUTCMonth() - 5);
  }
  const toIsoDate = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  return { dataInicio: toIsoDate(startDate), dataFim: toIsoDate(endDate) };
}

export function getPreviousDashboardPeriodData(range: DashboardPeriodData): DashboardPeriodData {
  const dayMilliseconds = 86_400_000;
  const start = Date.parse(`${range.dataInicio}T00:00:00Z`);
  const end = Date.parse(`${range.dataFim}T00:00:00Z`);
  const duration = end - start + dayMilliseconds;
  return {
    dataInicio: new Date(start - duration).toISOString().slice(0, 10),
    dataFim: new Date(start - dayMilliseconds).toISOString().slice(0, 10),
  };
}

export interface DashboardSalesByChannelResult extends DashboardSalesByChannelResponseDto {
  previous: DashboardSalesByChannelResponseDto | null;
}

async function readSalesByChannel(range: DashboardPeriodData): Promise<DashboardSalesByChannelResponseDto> {
  const { data } = await apiClient.get<DashboardSalesByChannelResponseDto>("/dashboard/vendas-por-canal", { params: range });
  if (![data?.presencial, data?.whatsapp, data?.site].every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error("DASHBOARD_SALES_BY_CHANNEL_INVALID_RESPONSE");
  }
  return data;
}

export type DashboardSection = "topProducts" | "criticalProducts" | "categoryData" | "temporalSeries" | "salesOverview" | "customerCount" | "recentSales";

function getAggregation(period: Period, range: DashboardPeriodData, isCustomRange: boolean) {
  if (!isCustomRange) return period === "diario" ? "HORA" : period === "semestre" ? "MES" : "DIA";
  const dayCount = (Date.parse(`${range.dataFim}T00:00:00Z`) - Date.parse(`${range.dataInicio}T00:00:00Z`)) / 86_400_000 + 1;
  if (dayCount === 1) return "HORA";
  return dayCount > 62 ? "MES" : "DIA";
}

export interface DashboardChartPoint {
  label: string;
  vendas: number;
  faturamento: number;
}

export interface DashboardDataResult {
  data: DashboardData;
  chartData: DashboardChartPoint[];
  failedSections: DashboardSection[];
}

export interface DashboardOverviewResult {
  sales: DashboardRecentSale[];
  customerCount: number;
  criticalCount: number;
  kpis: DashboardKpisResponseDto | null;
  failedSections: DashboardSection[];
}

export interface DashboardRecentSale {
  id: string;
  data: string;
  cliente: string;
  pagamento: string;
  total: number;
  status: "PENDENTE" | "FINALIZADA" | "CANCELADA";
}

function mapRecentSale(sale: DashboardRecentSalesResponseDto["vendas"][number]): DashboardRecentSale {
  const timestamp = sale.dataHoraVenda;
  if (!timestamp) throw new Error("DASHBOARD_RECENT_SALE_MISSING_TIMESTAMP");
  const [date, time] = timestamp.split(/[T ]/);
  const [year, month, day] = date.split("-");
  const formattedDate = year && month && day ? `${day}/${month}/${year}` : date;
  const formattedTime = time ? ` ${time.slice(0, 5)}` : "";
  return {
    id: `V-${sale.vendaId}`,
    data: `${formattedDate}${formattedTime}`,
    cliente: sale.cliente ?? "",
    pagamento: formatPaymentLabel(sale.formaPagamento),
    total: sale.valor ?? 0,
    status: sale.status,
  };
}

export const dashboardRepository = {
  async listSalesByChannel(period: Period, customRange?: DashboardPeriodData): Promise<DashboardSalesByChannelResult> {
    const range = customRange ?? getDashboardPeriodData(period);
    const [current, previous] = await Promise.allSettled([
      readSalesByChannel(range),
      readSalesByChannel(getPreviousDashboardPeriodData(range)),
    ]);
    if (current.status === "rejected") throw current.reason;
    return { ...current.value, previous: previous.status === "fulfilled" ? previous.value : null };
  },

  async listSalesOverview(period: Period, customRange?: DashboardPeriodData): Promise<DashboardOverviewResult> {
    const dateRange = customRange ?? getDashboardPeriodData(period);
    const [kpisResult, recentSalesResult] = await Promise.allSettled([
      apiClient.get<DashboardKpisResponseDto>("/dashboard/kpis", { params: dateRange }),
      apiClient.get<DashboardRecentSalesResponseDto>("/dashboard/vendas-recentes"),
    ]);
    const kpis = kpisResult.status === "fulfilled" ? kpisResult.value.data : null;
    let sales: DashboardRecentSale[] = [];
    let recentSalesFailed = recentSalesResult.status === "rejected";
    if (recentSalesResult.status === "fulfilled") {
      try {
        sales = recentSalesResult.value.data.vendas.map(mapRecentSale);
      } catch {
        recentSalesFailed = true;
      }
    }
    return {
      sales,
      customerCount: kpis?.clientesCadastrados ?? 0,
      criticalCount: kpis?.produtosCriticos ?? 0,
      kpis,
      failedSections: [
        ...(kpisResult.status === "rejected" ? ["salesOverview" as const, "customerCount" as const] : []),
        ...(recentSalesFailed ? ["recentSales" as const] : []),
      ],
    };
  },

  async listDashboardData(period: Period, customRange?: DashboardPeriodData): Promise<DashboardDataResult> {
    const dateRange = customRange ?? getDashboardPeriodData(period);
    const agrupamento = getAggregation(period, dateRange, customRange !== undefined);
    const [topResult, stockResult, categoriesResult, timeSeriesResult] = await Promise.allSettled([
      apiClient.get<TopProductsResponseDto>("/dashboard/top-produtos", { params: dateRange }),
      apiClient.get<CriticalStockResponseDto>("/dashboard/estoque-critico"),
      apiClient.get<CategoryDistributionResponseDto>("/dashboard/distribuicao-categorias", { params: dateRange }),
      apiClient.get<DashboardTimeSeriesResponseDto>("/dashboard/series-temporais", { params: { ...dateRange, agrupamento } }),
    ]);

    return {
      data: {
      topProducts: topResult.status === "fulfilled" ? topResult.value.data.produtos.map(product => ({
        id: product.produtoId,
        nome: product.nomeProduto,
        categoria: product.categoria,
        vendas: product.quantidadeVendas,
      })) : [],
      criticalProducts: stockResult.status === "fulfilled" ? stockResult.value.data.produtos.map(product => ({
        id: product.produtoId,
        name: product.nome,
        currentStock: product.quantidadeDisponivel,
        status: product.quantidadeDisponivel === 0 ? "esgotado" : "critico",
      })) : [],
      categoryData: categoriesResult.status === "fulfilled" ? categoriesResult.value.data.categorias.map(category => ({
        categoria: category.categoria,
        receita: category.valor,
      })) : [],
      },
      chartData: timeSeriesResult.status === "fulfilled" ? timeSeriesResult.value.data.periodos.map(point => ({
        label: point.rotulo,
        vendas: point.vendas,
        faturamento: Number(point.faturamento),
      })) : [],
      failedSections: [
        ...(topResult.status === "rejected" ? ["topProducts" as const] : []),
        ...(stockResult.status === "rejected" ? ["criticalProducts" as const] : []),
        ...(categoriesResult.status === "rejected" ? ["categoryData" as const] : []),
        ...(timeSeriesResult.status === "rejected" ? ["temporalSeries" as const] : []),
      ],
    };
  },
};