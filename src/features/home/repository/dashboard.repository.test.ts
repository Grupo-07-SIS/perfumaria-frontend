import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../core/services/http-client";
import { dashboardRepository, getDashboardPeriodData, getPreviousDashboardPeriodData } from "./dashboard.repository";

vi.mock("../../../core/services/http-client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("dashboardRepository", () => {
  it("carrega contagens agregadas por canal com o periodo informado", async () => {
    const counts = { presencial: 12, whatsapp: 7, site: 3 };
    const previous = { presencial: 6, whatsapp: 10, site: 0 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: counts } as never).mockResolvedValueOnce({ data: previous } as never);
    const range = { dataInicio: "2026-10-01", dataFim: "2026-10-20" };
    await expect(dashboardRepository.listSalesByChannel("30dias", range)).resolves.toEqual({ ...counts, previous });
    expect(apiClient.get).toHaveBeenCalledWith("/dashboard/vendas-por-canal", { params: range });
    expect(apiClient.get).toHaveBeenCalledWith("/dashboard/vendas-por-canal", { params: { dataInicio: "2026-09-11", dataFim: "2026-09-30" } });
  });

  it.each([
    ["2026-01-01", "2026-01-01", "2025-12-31", "2025-12-31"],
    ["2026-10-01", "2026-10-07", "2026-09-24", "2026-09-30"],
    ["2024-03-01", "2024-03-03", "2024-02-27", "2024-02-29"],
  ])("calcula periodo anterior equivalente a %s ate %s", (dataInicio, dataFim, previousStart, previousEnd) => {
    expect(getPreviousDashboardPeriodData({ dataInicio, dataFim })).toEqual({ dataInicio: previousStart, dataFim: previousEnd });
  });

  it("preserva a contagem atual quando apenas o periodo anterior falha", async () => {
    const counts = { presencial: 2, whatsapp: 1, site: 0 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: counts } as never).mockRejectedValueOnce(new Error("offline"));
    await expect(dashboardRepository.listSalesByChannel("7dias")).resolves.toEqual({ ...counts, previous: null });
  });

  it("nao substitui falha do periodo atual por dados do anterior", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("CURRENT_FAILED"))
      .mockResolvedValueOnce({ data: { presencial: 9, whatsapp: 0, site: 0 } } as never);
    await expect(dashboardRepository.listSalesByChannel("7dias")).rejects.toThrow("CURRENT_FAILED");
  });

  it.each([null, {}, { presencial: -1, whatsapp: 0, site: 0 }, { presencial: 1, whatsapp: "2", site: 0 }])("nao exibe uma resposta de canais invalida como zero: %s", async data => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data } as never);
    await expect(dashboardRepository.listSalesByChannel("7dias")).rejects.toThrow("DASHBOARD_SALES_BY_CHANNEL_INVALID_RESPONSE");
  });

  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["diario", "2026-10-07", "2026-10-07"],
    ["7dias", "2026-10-01", "2026-10-07"],
    ["30dias", "2026-09-08", "2026-10-07"],
    ["semestre", "2026-05-01", "2026-10-07"],
  ] as const)("creates inclusive date bounds for %s", (period, dataInicio, dataFim) => {
    expect(getDashboardPeriodData(period, new Date("2026-10-07T15:00:00-03:00"))).toEqual({ dataInicio, dataFim });
  });

  it("maps live DTOs and attaches date params only to period endpoints", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { produtos: [{ produtoId: 11, nomeProduto: "Perfume", categoria: "Perfumes", quantidadeVendas: 4 }] } } as never)
      .mockResolvedValueOnce({ data: { produtos: [{ produtoId: 12, nome: "Body Splash", quantidadeDisponivel: 0 }] } } as never)
      .mockResolvedValueOnce({ data: { categorias: [{ categoriaId: 1, categoria: "Perfumes", valor: 120 }], totalPeriodo: 120 } } as never)
      .mockResolvedValueOnce({ data: { periodos: [{ inicio: "2026-10-01T00:00:00", rotulo: "01/10", vendas: 4, faturamento: 340.5 }] } } as never);

    const result = await dashboardRepository.listDashboardData("7dias");

    expect(result).toEqual({
      data: {
        topProducts: [{ id: 11, nome: "Perfume", categoria: "Perfumes", vendas: 4 }],
        criticalProducts: [{ id: 12, name: "Body Splash", currentStock: 0, status: "esgotado" }],
        categoryData: [{ categoria: "Perfumes", receita: 120 }],
      },
      chartData: [{ label: "01/10", vendas: 4, faturamento: 340.5 }],
      failedSections: [],
    });
    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/dashboard/top-produtos", { params: { dataInicio: expect.any(String), dataFim: expect.any(String) } });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/dashboard/estoque-critico");
    expect(apiClient.get).toHaveBeenNthCalledWith(3, "/dashboard/distribuicao-categorias", { params: { dataInicio: expect.any(String), dataFim: expect.any(String) } });
    expect(apiClient.get).toHaveBeenNthCalledWith(4, "/dashboard/series-temporais", { params: { dataInicio: expect.any(String), dataFim: expect.any(String), agrupamento: "DIA" } });
  });

  it("keeps successful sections when another endpoint fails", async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(new Error("top unavailable"))
      .mockResolvedValueOnce({ data: { produtos: [] } } as never)
      .mockResolvedValueOnce({ data: { categorias: [], totalPeriodo: 0 } } as never)
      .mockRejectedValueOnce(new Error("series unavailable"));

    const result = await dashboardRepository.listDashboardData("diario");

    expect(result.failedSections).toEqual(["topProducts", "temporalSeries"]);
    expect(result.data.criticalProducts).toEqual([]);
    expect(result.data.categoryData).toEqual([]);
    expect(result.chartData).toEqual([]);
  });

  it.each([
    ["diario", "HORA"],
    ["7dias", "DIA"],
    ["30dias", "DIA"],
    ["semestre", "MES"],
  ] as const)("uses %s period grouping %s", async (period, agrupamento) => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { produtos: [] } } as never)
      .mockResolvedValueOnce({ data: { produtos: [] } } as never)
      .mockResolvedValueOnce({ data: { categorias: [], totalPeriodo: 0 } } as never)
      .mockResolvedValueOnce({ data: { periodos: [] } } as never);

    await dashboardRepository.listDashboardData(period);

    expect(apiClient.get).toHaveBeenNthCalledWith(4, "/dashboard/series-temporais", {
      params: { dataInicio: expect.any(String), dataFim: expect.any(String), agrupamento },
    });
  });

  it("sends custom inclusive bounds and daily temporal aggregation", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { produtos: [] } } as never)
      .mockResolvedValueOnce({ data: { produtos: [] } } as never)
      .mockResolvedValueOnce({ data: { categorias: [], totalPeriodo: 0 } } as never)
      .mockResolvedValueOnce({ data: { periodos: [] } } as never);
    const range = { dataInicio: "2026-10-05", dataFim: "2026-10-08" };

    await dashboardRepository.listDashboardData("7dias", range);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/dashboard/top-produtos", { params: range });
    expect(apiClient.get).toHaveBeenNthCalledWith(3, "/dashboard/distribuicao-categorias", { params: range });
    expect(apiClient.get).toHaveBeenNthCalledWith(4, "/dashboard/series-temporais", { params: { ...range, agrupamento: "DIA" } });
  });

  it("loads dashboard KPIs and recent sales from the dashboard endpoints", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: {
        vendasPeriodo: { vendas: 2, comparacaoPeriodoAnterior: 100 },
        faturamentoPeriodo: { valor: 80, comparacaoAnterior: 50 },
        margemLucro: { valor: 20, comparacaoAnterior: 10 },
        ticketMedio: { valor: 40, comparacaoAnterior: 5 },
        clientesCadastrados: 3,
        produtosCriticos: 2,
      } } as never)
      .mockResolvedValueOnce({ data: { vendas: [
        { vendaId: 7, cliente: "Cliente", dataHoraVenda: "2026-10-06T14:30:00", formaPagamento: "PIX", valor: 80, status: "FINALIZADA" },
        { vendaId: 8, cliente: "Outro cliente", dataHoraVenda: "2026-10-05T00:00:00", formaPagamento: "DINHEIRO", valor: 40, status: "PENDENTE" },
      ] } } as never);

    const result = await dashboardRepository.listSalesOverview("7dias");

    expect(result.customerCount).toBe(3);
    expect(result.criticalCount).toBe(2);
    expect(result.kpis?.vendasPeriodo.vendas).toBe(2);
    expect(result.failedSections).toEqual([]);
    expect(result.sales).toMatchObject([
      { id: "V-7", data: "06/10/2026 14:30", pagamento: "Pix", total: 80, status: "FINALIZADA" },
      { id: "V-8", data: "05/10/2026 00:00", pagamento: "Dinheiro", total: 40, status: "PENDENTE" },
    ]);
    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/dashboard/kpis", { params: { dataInicio: expect.any(String), dataFim: expect.any(String) } });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/dashboard/vendas-recentes");
  });

  it.each([
    ["PIX", "Pix"],
    ["pix", "Pix"],
    ["DINHEIRO", "Dinheiro"],
    ["CARTAO_CREDITO", "Cartão de crédito"],
    ["CARTAO_DE_DEBITO", "Cartão de débito"],
    ["Cartão de crédito", "Cartão de crédito"],
    ["  cartão de débito  ", "Cartão de débito"],
    ["TRANSFERENCIA_BANCARIA", "Transferência bancária"],
    ["Transferência bancária", "Transferência bancária"],
    [null, ""],
    [undefined, ""],
    ["   ", ""],
    ["Outro pagamento", "Outro pagamento"],
  ])("standardizes recent sale payment %s as %s", async (formaPagamento, pagamento) => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: null } as never)
      .mockResolvedValueOnce({ data: { vendas: [
        { vendaId: 9, dataHoraVenda: "2026-10-06T14:30:00", formaPagamento, status: "FINALIZADA" },
      ] } } as never);

    const result = await dashboardRepository.listSalesOverview("7dias");

    expect(result.failedSections).toEqual([]);
    expect(result.sales[0].pagamento).toBe(pagamento);
  });

  it("isolates malformed recent sales from successful KPI results", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: {
        vendasPeriodo: { vendas: 3, comparacaoPeriodoAnterior: 50 },
        faturamentoPeriodo: { valor: 150, comparacaoAnterior: 20 },
        margemLucro: { valor: 25, comparacaoAnterior: 2 },
        ticketMedio: { valor: 50, comparacaoAnterior: 10 },
        clientesCadastrados: 4,
        produtosCriticos: 1,
      } } as never)
      .mockResolvedValueOnce({ data: { vendas: [
        { vendaId: 9, cliente: "Cliente", formaPagamento: "PIX", valor: 50, status: "FINALIZADA" },
      ] } } as never);

    const result = await dashboardRepository.listSalesOverview("7dias");

    expect(result.kpis?.vendasPeriodo.vendas).toBe(3);
    expect(result.sales).toEqual([]);
    expect(result.failedSections).toEqual(["recentSales"]);
  });
});