import type { Product, Cliente, Venda } from "../../../core/store/AppContext";
import type { Period } from "../models/home.models";
import type { CHART_DATA, CATEGORIA_DATA, KPI_DATA, TOP_PRODUTOS } from "../repository/home.repository";
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
