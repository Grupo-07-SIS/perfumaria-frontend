import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import { HomePage } from "./HomePage";
import { dashboardRepository } from "./repository/dashboard.repository";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn(), subscribeToClear: vi.fn(() => () => {}) },
}));
vi.mock("./repository/dashboard.repository", async importOriginal => {
  const original = await importOriginal<typeof import("./repository/dashboard.repository")>();
  return {
    ...original,
    dashboardRepository: { listDashboardData: vi.fn(), listSalesOverview: vi.fn() },
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
    expect(screen.getByText("Ticket Médio")).toBeInTheDocument();
    expect(screen.getByText("R$ 104,50")).toBeInTheDocument();
    expect(screen.getByText("+12,35% vs anterior")).toBeInTheDocument();
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
  });

  it("simula ausencia de dados sem apagar o contexto nem perder o periodo selecionado", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "30 dias", exact: true }));
    await user.click(screen.getByRole("button", { name: "Simular dashboard sem dados (primeiro acesso)" }));
    expect(screen.getByText("Nenhuma venda registrada ainda")).toBeInTheDocument();
    expect(screen.getByText("Sem vendas finalizadas")).toBeInTheDocument();
    expect(screen.getAllByText("Simulação sem dados")).toHaveLength(2);
    expect(screen.getByText("Nenhum produto vendido ainda")).toBeInTheDocument();
    expect(screen.getByText("Sem dados por categoria")).toBeInTheDocument();
    expect(screen.getByText("Nenhum produto cadastrado ainda")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma venda realizada ainda")).toBeInTheDocument();
    expect(screen.queryByText("Chanel N°5")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sair da simulação e ver dados reais" }));
    expect(await screen.findByText("Chanel N°5")).toBeInTheDocument();
    expect(screen.queryByText("Modo de simulação ativo.")).not.toBeInTheDocument();
  });

  it("funcionario ve atalhos sem chamar endpoints administrativos", () => {
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, cargo: "Funcionário" } });
    vi.mocked(dashboardRepository.listDashboardData).mockClear();
    vi.mocked(dashboardRepository.listSalesOverview).mockClear();
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
  });
});