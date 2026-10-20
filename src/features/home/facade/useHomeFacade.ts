import { useHomeRepository } from "../repository/home.repository";
import { useEffect, useState } from "react";
import type { Period, SalesChannel } from "../models/home.models";
import { dashboardRepository, type DashboardData, type DashboardDataResult, type DashboardOverviewResult, type DashboardSection, type DashboardSalesByChannelResult } from "../repository/dashboard.repository";
import type { DashboardPeriodData } from "../repository/dto/dashboard.dto";
import { formatBrazilianDate, parseBrazilianDate, selectChannelSales } from "../services/home.service";
export function useHomeFacade() {
  const { currentUser } = useHomeRepository();
  const isAdmin = currentUser?.cargo === "Administrador";
  const [period, setPeriodState] = useState<Period>("7dias");
  const [customMode, setCustomMode] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customRange, setCustomRange] = useState<DashboardPeriodData | null>(null);
  const [customPeriodError, setCustomPeriodError] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData>({ topProducts: [], criticalProducts: [], categoryData: [] });
  const [chartData, setChartData] = useState<DashboardDataResult["chartData"]>([]);
  const [failedSections, setFailedSections] = useState<DashboardSection[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(isAdmin);
  const [sales, setSales] = useState<DashboardOverviewResult["sales"]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [kpis, setKpis] = useState<DashboardOverviewResult["kpis"]>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(isAdmin);
  const [salesChannel, setSalesChannel] = useState<SalesChannel>("todos");
  const [salesByChannel, setSalesByChannel] = useState<DashboardSalesByChannelResult | null>(null);
  const [isChannelsLoading, setIsChannelsLoading] = useState(isAdmin);
  const [channelsError, setChannelsError] = useState(false);
  const [channelsAttempt, setChannelsAttempt] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      setSalesByChannel(null);
      setIsChannelsLoading(false);
      setChannelsError(false);
      return;
    }
    let isActive = true;
    setSalesByChannel(null);
    setIsChannelsLoading(true);
    setChannelsError(false);
    dashboardRepository.listSalesByChannel(period, customRange ?? undefined).then(counts => {
      if (isActive) setSalesByChannel(counts);
    }).catch(() => {
      if (isActive) setChannelsError(true);
    }).finally(() => {
      if (isActive) setIsChannelsLoading(false);
    });
    return () => { isActive = false; };
  }, [isAdmin, period, customRange, channelsAttempt]);

  const setPeriod = (nextPeriod: Period) => {
    setPeriodState(nextPeriod);
    setCustomMode(false);
    setCustomRange(null);
    setCustomPeriodError("");
  };

  const activateCustomPeriod = () => {
    setCustomMode(true);
    setCustomPeriodError("");
  };

  const updateCustomStartDate = (date?: Date) => setCustomStartDate(formatBrazilianDate(date));
  const updateCustomEndDate = (date?: Date) => setCustomEndDate(formatBrazilianDate(date));

  const applyCustomPeriod = () => {
    if (!customStartDate || !customEndDate) {
      setCustomPeriodError("Informe a data inicial e a data final.");
      return;
    }
    const dataInicio = parseBrazilianDate(customStartDate);
    const dataFim = parseBrazilianDate(customEndDate);
    if (!dataInicio || !dataFim) {
      setCustomPeriodError("Informe datas existentes no calendário no formato DD/MM/AAAA.");
      return;
    }
    if (dataInicio > dataFim) {
      setCustomPeriodError("A data inicial deve ser anterior ou igual à data final.");
      return;
    }
    setCustomPeriodError("");
    setCustomRange({ dataInicio, dataFim });
  };

  const formatShortDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };
  const periodLabel = customRange
    ? `${formatShortDate(customRange.dataInicio)} - ${formatShortDate(customRange.dataFim)}`
    : "";

  useEffect(() => {
    if (!isAdmin) {
      setDashboardData({ topProducts: [], criticalProducts: [], categoryData: [] });
      setChartData([]);
      setSales([]);
      setCustomerCount(0);
      setCriticalCount(0);
      setKpis(null);
      setFailedSections([]);
      setIsDashboardLoading(false);
      setIsOverviewLoading(false);
      return;
    }
    let isActive = true;
    setIsDashboardLoading(true);
    setIsOverviewLoading(true);
    dashboardRepository.listSalesOverview(period, customRange ?? undefined).then(result => {
      if (!isActive) return;
      setSales(result.sales);
      setCustomerCount(result.customerCount);
      setCriticalCount(result.criticalCount);
      setKpis(result.kpis);
      setFailedSections(current => [...new Set([...current.filter(section => section !== "salesOverview" && section !== "customerCount" && section !== "recentSales"), ...result.failedSections])]);
    }).catch(() => {
      if (!isActive) return;
      setSales([]);
      setCustomerCount(0);
      setCriticalCount(0);
      setKpis(null);
      setFailedSections(current => [...new Set([...current, "salesOverview", "customerCount", "recentSales"])]);
    }).finally(() => {
      if (isActive) setIsOverviewLoading(false);
    });
    dashboardRepository.listDashboardData(period, customRange ?? undefined).then(result => {
      if (!isActive) return;
      setDashboardData(result.data);
      setChartData(result.chartData);
      setFailedSections(current => [...new Set([...current.filter(section => section === "salesOverview" || section === "customerCount" || section === "recentSales"), ...result.failedSections])]);
    }).catch(() => {
      if (!isActive) return;
      setDashboardData({ topProducts: [], criticalProducts: [], categoryData: [] });
      setChartData([]);
      setFailedSections(current => [...new Set([...current.filter(section => section === "salesOverview" || section === "customerCount" || section === "recentSales"), "topProducts", "criticalProducts", "categoryData"]) ]);
    }).finally(() => {
      if (isActive) setIsDashboardLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, [isAdmin, period, customRange]);

  const margemPercReal = kpis?.margemLucro.valor ?? null;
  const margemPerc = margemPercReal ?? 0;
  const summaryAvailable = !isOverviewLoading && !failedSections.includes("salesOverview");
  const recentSalesAvailable = !isOverviewLoading && !failedSections.includes("recentSales");
  const channelMetrics = selectChannelSales(salesByChannel, salesChannel);
  return {
    vendas: sales,
    currentUser,
    isAdmin,
    period,
    setPeriod,
    customMode,
    activateCustomPeriod,
    periodLabel,
    customStartDate,
    selectCustomStartDate: updateCustomStartDate,
    customEndDate,
    selectCustomEndDate: updateCustomEndDate,
    customRangeActive: customRange !== null,
    customPeriodError,
    applyCustomPeriod,
    chartData,
    categoriaData: dashboardData.categoryData,
    criticalProducts: dashboardData.criticalProducts,
    criticalCount,
    produtosComMargem: [],
    margemPercReal,
    margemPerc,
    margemBRL: (kpis?.faturamentoPeriodo.valor ?? 0) * margemPerc / 100,
    vendasRecentes: !recentSalesAvailable ? [] : sales,
    totalVendasKpi: kpis?.vendasPeriodo.vendas ?? 0,
    salesChange: kpis?.vendasPeriodo.comparacaoPeriodoAnterior,
    faturamentoKpi: kpis?.faturamentoPeriodo.valor ?? 0,
    revenueChange: kpis?.faturamentoPeriodo.comparacaoAnterior,
    marginChange: kpis?.margemLucro.comparacaoAnterior,
    salesChannel,
    setSalesChannel,
    channelSalesCount: channelMetrics.count,
    channelSalesChange: channelMetrics.change,
    channelsAvailable: salesByChannel !== null && !isChannelsLoading && !channelsError,
    isChannelsLoading,
    channelsError,
    retrySalesByChannel: () => setChannelsAttempt(attempt => attempt + 1),
    topProdutos: dashboardData.topProducts,
    isDashboardLoading: isDashboardLoading || isOverviewLoading,
    failedSections,
    summaryAvailable,
    marginAvailable: summaryAvailable && kpis !== null
  };
}
