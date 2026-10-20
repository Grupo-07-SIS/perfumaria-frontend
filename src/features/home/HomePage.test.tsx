import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import { HomePage } from "./HomePage";
import { dashboardRepository } from "./repository/dashboard.repository";
import type { DashboardSalesByChannelResult } from "./repository/dashboard.repository";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn(), subscribeToClear: vi.fn(() => () => {}) },
}));
vi.mock("./repository/dashboard.repository", async importOriginal => {
  const original = await importOriginal<typeof import("./repository/dashboard.repository")>();
  return {
    ...original,
    dashboardRepository: { listDashboardData: vi.fn(), listSalesOverview: vi.fn(), listSalesByChannel: vi.fn() },
  };
});
vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: (props: React.ComponentProps<typeof original.ResponsiveContainer>) => (
      <original.ResponsiveContainer {...props} initialDimension={{ width: 800, height: 200 }} />
    ),
  };
});

function renderHome() {
  return render(<MemoryRouter><AppProvider><HomePage /></AppProvider></MemoryRouter>);
}

describe("Home: caracterizacao dos indicadores", () => {
  beforeEach(() => {
    vi.mocked(dashboardRepository.listSalesByChannel).mockReset();
    vi.mocked(dashboardRepository.listSalesByChannel).mockResolvedValue({ presencial: 12, whatsapp: 7, site: 3, previous: { presencial: 6, whatsapp: 14, site: 3 } });
    const today = new Date().toLocaleDateString("pt-BR");
    vi.mocked(dashboardRepository.listDashboardData).mockResolvedValue({
      data: {
        topProducts: [{ id: 1, nome: "Chanel N°5", categoria: "Perfumes", vendas: 5 }],
        criticalProducts: [{ id: 2, name: "Dior Sauvage", currentStock: 0, status: "esgotado" }],
        categoryData: [{ categoria: "Perfumes", receita: 120 }],
      },
      chartData: [
        { label: "08h", vendas: 1, faturamento: 89 },
        { label: "12h", vendas: 1, faturamento: 120 },
      ],
      failedSections: [],
    });
    vi.mocked(dashboardRepository.listSalesOverview).mockResolvedValue({
      sales: [
        { id: "V-1", data: `${today} 12:00`, cliente: "Ana Lima", pagamento: "Pix", total: 89, status: "FINALIZADA" },
        { id: "V-2", data: `${today} 13:00`, cliente: "Carlos Mendes", pagamento: "Dinheiro", total: 120, status: "PENDENTE" },
      ],
      customerCount: 3,
      criticalCount: 1,
      kpis: {
        vendasPeriodo: { vendas: 2, comparacaoPeriodoAnterior: 100 },
        faturamentoPeriodo: { valor: 209, comparacaoAnterior: 83.77094273568392 },
        margemLucro: { valor: -477.8, comparacaoAnterior: -1294.97827513553648 },
        ticketMedio: { valor: 104.5, comparacaoAnterior: 12.345 },
        clientesCadastrados: 3,
        produtosCriticos: 1,
      },
      failedSections: [],
    });
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.mocked(sessionService.restore).mockReturnValue({
      accessToken: "test-only", expiresAt: "2099-01-01T00:00:00Z",
      user: { id: "qa-admin", nome: "Admin teste", email: "admin@example.test", cargo: "Administrador" },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(["Diário", "7 dias", "30 dias", "Semestre"])("seleciona o período $period", async period => {
    const user = userEvent.setup();
    renderHome();
    expect(screen.getByRole("heading", { name: /Quantidade de Vendas.*7 dias/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: period, exact: true }));
    expect(screen.getByRole("heading", { name: new RegExp(`^Faturamento.*${period}$`) })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: new RegExp(`^Quantidade de Vendas.*${period}$`) })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: new RegExp(`^Distribuição por Categoria.*${period}$`) })).toBeInTheDocument();
    expect(await screen.findByText("Chanel N°5")).toBeInTheDocument();
    expect(screen.getByText("R$ 209,00")).toBeInTheDocument();
    expect(screen.getByText("+83,77% vs anterior")).toBeInTheDocument();
    expect(screen.getByText("-1.294,98% vs anterior")).toBeInTheDocument();
    expect(screen.getByText("-477,80%")).toBeInTheDocument();
    expect(screen.getByText("Perda: R$ 998,60")).toHaveStyle({ color: "#dc2626" });
    expect(screen.queryByText("Ticket Médio")).not.toBeInTheDocument();
    expect(screen.getByText("Vendas por canal")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Canal das vendas" })).toHaveValue("todos");
    expect(screen.queryByText("Clientes Cadastrados")).not.toBeInTheDocument();
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.queryByText("Aguardando endpoint de resumo")).not.toBeInTheDocument();
    expect(dashboardRepository.listDashboardData).toHaveBeenLastCalledWith(expect.any(String), undefined);
  });

  it("valida e aplica um intervalo personalizado nos indicadores", async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByText("Chanel N°5");
    vi.mocked(dashboardRepository.listDashboardData).mockClear();
    vi.mocked(dashboardRepository.listSalesOverview).mockClear();

    expect(screen.queryByPlaceholderText("DD/MM/AAAA")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Personalizado" }));
    await user.click(screen.getByRole("button", { name: "Aplicar período personalizado" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Informe a data inicial e a data final.");
    expect(dashboardRepository.listDashboardData).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Selecionar Data inicial" }));
    await user.click(screen.getByText("9", { selector: "button" }));
    await user.click(screen.getByRole("button", { name: "Selecionar Data final" }));
    await user.click(screen.getByText("8", { selector: "button" }));
    await user.click(screen.getByRole("button", { name: "Aplicar período personalizado" }));
    expect(screen.getByRole("alert")).toHaveTextContent("A data inicial deve ser anterior ou igual à data final.");
    expect(dashboardRepository.listDashboardData).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Selecionar Data final" }));
    await user.click(screen.getByText("9", { selector: "button" }));
    await user.click(screen.getByRole("button", { name: "Aplicar período personalizado" }));

    expect(await screen.findByRole("heading", { name: /Faturamento.*09\/10\/2026 - 09\/10\/2026/ })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Personalizado: 09/10/2026 - 09/10/2026");
    expect(dashboardRepository.listDashboardData).toHaveBeenLastCalledWith("7dias", { dataInicio: "2026-10-09", dataFim: "2026-10-09" });
    expect(dashboardRepository.listSalesOverview).toHaveBeenLastCalledWith("7dias", { dataInicio: "2026-10-09", dataFim: "2026-10-09" });
    expect(dashboardRepository.listSalesByChannel).toHaveBeenLastCalledWith("7dias", { dataInicio: "2026-10-09", dataFim: "2026-10-09" });
  });

  it("nao oferece simulacao sem dados e preserva os dados reais ao trocar periodo", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "30 dias", exact: true }));
    expect(await screen.findByText("Chanel N°5")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /simula/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Modo de simulação ativo.")).not.toBeInTheDocument();
  });

  it("mantem o estado vazio quando a API realmente nao retorna dados", async () => {
    vi.mocked(dashboardRepository.listDashboardData).mockResolvedValueOnce({
      data: { topProducts: [], criticalProducts: [], categoryData: [] }, chartData: [], failedSections: [],
    });
    vi.mocked(dashboardRepository.listSalesOverview).mockResolvedValueOnce({
      sales: [], customerCount: 0, criticalCount: 0, kpis: null, failedSections: [],
    });
    renderHome();
    expect(await screen.findAllByText("Sem movimentação no período")).toHaveLength(2);
    expect(screen.getByText("Nenhum produto vendido no período")).toBeInTheDocument();
    expect(screen.getByText("Nenhum produto em estoque crítico")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma venda recente")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /simula/i })).not.toBeInTheDocument();
  });

  it("funcionario ve atalhos sem chamar endpoints administrativos", () => {
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, cargo: "Funcionário" } });
    vi.mocked(dashboardRepository.listDashboardData).mockClear();
    vi.mocked(dashboardRepository.listSalesOverview).mockClear();
    vi.mocked(dashboardRepository.listSalesByChannel).mockClear();
    renderHome();
    expect(screen.queryByText("Vendas no Período")).not.toBeInTheDocument();
    expect(screen.queryByText("Faturamento no Período")).not.toBeInTheDocument();
    expect(screen.queryByText("Margem de Lucro")).not.toBeInTheDocument();
    expect(screen.queryByText("Clientes Cadastrados")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Estoque Crítico" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vendas Recentes" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Registrar Venda/ })).toHaveAttribute("href", "/vendas/registrar");
    expect(screen.getByRole("link", { name: /Pedidos Online/ })).toHaveAttribute("href", "/vendas/pedidos");
    expect(dashboardRepository.listDashboardData).not.toHaveBeenCalled();
    expect(dashboardRepository.listSalesOverview).not.toHaveBeenCalled();
    expect(dashboardRepository.listSalesByChannel).not.toHaveBeenCalled();
    expect(screen.queryByRole("combobox", { name: "Canal das vendas" })).not.toBeInTheDocument();
  });

  it("seleciona todos os canais, presencial, WhatsApp e Site sem refazer consultas", async () => {
    const user = userEvent.setup();
    renderHome();
    const card = within(screen.getByText("Vendas por canal").closest(".peract-bg-card")!);
    expect(await card.findByText("22", { exact: true })).toBeInTheDocument();
    const select = card.getByRole("combobox", { name: "Canal das vendas" });
    for (const [channel, count, change] of [["presencial", "12", "+100,00% vs anterior"], ["whatsapp", "7", "-50,00% vs anterior"], ["site", "3", "+0,00% vs anterior"], ["todos", "22", "-4,35% vs anterior"]]) {
      await user.selectOptions(select, channel);
      expect(card.getByText(count, { exact: true })).toBeInTheDocument();
      expect(card.getByText(change, { exact: true })).toBeInTheDocument();
    }
    expect(dashboardRepository.listSalesByChannel).toHaveBeenCalledTimes(1);
  });

  it("exibe zero quando o canal nao possui vendas", async () => {
    vi.mocked(dashboardRepository.listSalesByChannel).mockResolvedValueOnce({ presencial: 0, whatsapp: 0, site: 0, previous: { presencial: 0, whatsapp: 0, site: 0 } });
    renderHome();
    const card = within(screen.getByText("Vendas por canal").closest(".peract-bg-card")!);
    expect(await card.findByText("0", { exact: true })).toBeInTheDocument();
    expect(card.queryByText("Não foi possível carregar vendas por canal")).not.toBeInTheDocument();
    expect(card.getByText("+0,00% vs anterior")).toBeInTheDocument();
  });

  it("mantem o total quando apenas a comparacao anterior falha", async () => {
    vi.mocked(dashboardRepository.listSalesByChannel).mockResolvedValueOnce({ presencial: 12, whatsapp: 7, site: 3, previous: null });
    renderHome();
    const card = within(screen.getByText("Vendas por canal").closest(".peract-bg-card")!);
    expect(await card.findByText("22", { exact: true })).toBeInTheDocument();
    expect(card.getByText("Comparação com período anterior indisponível")).toBeInTheDocument();
    expect(card.queryByText(/% vs anterior/)).not.toBeInTheDocument();
  });

  it("isola falha de canais e permite repetir sem ocultar os demais indicadores", async () => {
    vi.mocked(dashboardRepository.listSalesByChannel).mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    renderHome();
    expect(await screen.findByText("Não foi possível carregar vendas por canal")).toBeInTheDocument();
    expect(await screen.findByText("R$ 209,00")).toBeInTheDocument();
    const grid = screen.getByText("Vendas por canal").closest('[data-tour="tour-home-kpis"]');
    expect(grid).toHaveClass("items-start", "grid-cols-1", "sm:grid-cols-2", "xl:grid-cols-4");
    expect(grid?.children).toHaveLength(4);
    Array.from(grid!.children).forEach(card => {
      expect(card).toHaveClass("h-48", "flex-col");
      expect(card.querySelector('[data-slot="kpi-header"]')).toHaveClass("h-14", "shrink-0");
    });
    expect(screen.getByRole("combobox", { name: "Canal das vendas" }).closest('[data-slot="kpi-header"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Recarregar vendas por canal" })).toHaveAttribute("title", "Tentar novamente");
    expect(screen.queryByText("Tentar novamente", { exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Recarregar vendas por canal" }));
    const card = within(screen.getByText("Vendas por canal").closest(".peract-bg-card")!);
    expect(await card.findByText("22", { exact: true })).toBeInTheDocument();
  });

  it("ignora resposta atrasada do periodo anterior", async () => {
    let resolveOld!: (value: DashboardSalesByChannelResult) => void;
    vi.mocked(dashboardRepository.listSalesByChannel).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
      .mockResolvedValueOnce({ presencial: 1, whatsapp: 2, site: 3, previous: { presencial: 0, whatsapp: 0, site: 0 } });
    const user = userEvent.setup();
    renderHome();
    const card = within(screen.getByText("Vendas por canal").closest(".peract-bg-card")!);
    expect(card.getByText("Carregando vendas por canal...")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "30 dias", exact: true }));
    expect(await card.findByText("6", { exact: true })).toBeInTheDocument();
    await act(async () => { resolveOld({ presencial: 100, whatsapp: 100, site: 100, previous: { presencial: 1, whatsapp: 1, site: 1 } }); });
    expect(card.getByText("6", { exact: true })).toBeInTheDocument();
    expect(card.queryByText("300", { exact: true })).not.toBeInTheDocument();
  });
});