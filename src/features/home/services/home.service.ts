import type { Product, Cliente, Venda } from "../../../core/store/AppContext";
import type { Period } from "../models/home.models";
import type { CHART_DATA, CATEGORIA_DATA, KPI_DATA, TOP_PRODUTOS } from "../repository/home.repository";
import { getDashboardPeriodData } from "../repository/dashboard.repository";
export function fmtBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
export function fmtBRLShort(v: number) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1).replace(".", ",")}k`;
  return `R$ ${v.toFixed(0)}`;
}

export function parseBrazilianDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  if (numericYear < 1 || numericMonth < 1 || numericMonth > 12 || numericDay < 1 || numericDay > 31) return null;
  const date = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay));
  if (date.getUTCFullYear() !== numericYear || date.getUTCMonth() !== numericMonth - 1 || date.getUTCDate() !== numericDay) return null;
  return `${year}-${month}-${day}`;
}

export function formatBrazilianDate(date?: Date) {
  if (!date) return "";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export function brazilianDateToLocalDate(value: string) {
  const isoDate = parseBrazilianDate(value);
  if (!isoDate) return undefined;
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function selectSalesOverview(sales: Venda[], period: Period, currentDate = new Date()) {
  const range = getDashboardPeriodData(period, currentDate);
  const inPeriod = sales.filter(sale => {
    if (!sale.data) return false;
    const [day, month, year] = sale.data.slice(0, 10).split("/");
    const date = `${year}-${month}-${day}`;
    return date >= range.dataInicio && date <= range.dataFim;
  });
  const completedSales = inPeriod.filter(sale => !sale.cancelada && (sale.tipoVenda === "presencial" || sale.enviado));
  const chartBuckets = new Map<string, { label: string; faturamento: number; vendas: number }>();
  const start = new Date(`${range.dataInicio}T00:00:00`);
  const end = new Date(`${range.dataFim}T00:00:00`);
  if (period === "semestre") {
    const monthCursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (monthCursor <= end) {
      const key = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;
      chartBuckets.set(key, { label: monthCursor.toLocaleDateString("pt-BR", { month: "short" }), faturamento: 0, vendas: 0 });
      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }
  } else if (period === "diario") {
    for (let hour = 0; hour < 24; hour += 4) {
      const key = `${range.dataFim}T${String(hour).padStart(2, "0")}`;
      chartBuckets.set(key, { label: `${String(hour).padStart(2, "0")}h`, faturamento: 0, vendas: 0 });
    }
  } else {
    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      chartBuckets.set(key, { label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), faturamento: 0, vendas: 0 });
    }
  }
  for (const sale of inPeriod) {
    if (sale.cancelada) continue;
    const [day, month, year] = sale.data.slice(0, 10).split("/");
    const isoDate = `${year}-${month}-${day}`;
    const hour = sale.data.slice(11, 13);
    const bucketKey = period === "semestre" ? isoDate.slice(0, 7) : period === "diario" ? `${isoDate}T${String(Math.floor(Number(hour || 0) / 4) * 4).padStart(2, "0")}` : isoDate;
    const bucket = chartBuckets.get(bucketKey);
    if (!bucket) continue;
    bucket.vendas += 1;
    if (sale.tipoVenda === "presencial" || sale.enviado) bucket.faturamento += sale.total;
  }
  const recentSales = [...sales]
    .filter(sale => !sale.cancelada)
    .sort((left, right) => {
      const toTimestamp = (value: string) => {
        const [day, month, year] = value.slice(0, 10).split("/");
        const time = value.slice(11) || "00:00";
        return new Date(`${year}-${month}-${day}T${time}:00`).getTime();
      };
      return toTimestamp(right.data) - toTimestamp(left.data);
    })
    .slice(0, 6);
  return {
    totalSales: inPeriod.filter(sale => !sale.cancelada).length,
    revenue: completedSales.reduce((total, sale) => total + sale.total, 0),
    chartData: [...chartBuckets.values()],
    recentSales,
  };
}
export function selectHomeMetrics({
  products,
  clientes,
  vendas,
  period,
  emptyMode,
  chartSource,
  categorySource,
  kpiSource,
  topProductsSource
}: {
  products: Product[];
  clientes: Cliente[];
  vendas: Venda[];
  period: Period;
  emptyMode: boolean;
  chartSource: typeof CHART_DATA;
  categorySource: typeof CATEGORIA_DATA;
  kpiSource: typeof KPI_DATA;
  topProductsSource: typeof TOP_PRODUTOS;
}) {
  const chartData = emptyMode ? [] : chartSource[period];
  const categoriaData = emptyMode ? [] : categorySource[period];
  const kpi = kpiSource[period];
  const criticalProducts = emptyMode ? [] : products.filter(p => p.status !== "ok");
  const produtosComMargem = products.filter(p => p.precoCompra && p.precoCompra > 0);
  const margemPercReal = produtosComMargem.length > 0 ? produtosComMargem.reduce((acc, p) => acc + (p.preco - p.precoCompra!) / p.preco * 100, 0) / produtosComMargem.length : null;
  const margemPerc = margemPercReal ?? kpi.margem;
  const margemBRL = emptyMode ? 0 : kpi.faturamento * margemPerc / 100;
  const vendasRecentes = emptyMode ? [] : [...vendas].filter(v => !v.cancelada).sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6);
  const totalVendasKpi = emptyMode ? 0 : kpi.vendas;
  const faturamentoKpi = emptyMode ? 0 : kpi.faturamento;
  const clientesKpi = emptyMode ? 0 : clientes.length;
  const topProdutos = emptyMode ? [] : topProductsSource;
  return {
    chartData,
    categoriaData,
    kpi,
    criticalProducts,
    produtosComMargem,
    margemPercReal,
    margemPerc,
    margemBRL,
    vendasRecentes,
    totalVendasKpi,
    faturamentoKpi,
    clientesKpi,
    topProdutos
  };
}
