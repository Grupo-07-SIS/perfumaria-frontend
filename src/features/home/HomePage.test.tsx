import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import { HomePage } from "./HomePage";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn() },
}));
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

  it.each([
    { period: "Diário", sales: "20", revenue: "R$ 2.170,00", change: "+12% vs anterior" },
    { period: "7 dias", sales: "50", revenue: "R$ 5.370,00", change: "+8% vs anterior" },
    { period: "30 dias", sales: "119", revenue: "R$ 12.000,00", change: "-3% vs anterior" },
    { period: "Semestre", sales: "291", revenue: "R$ 31.300,00", change: "+15% vs anterior" },
  ])("seleciona $period e atualiza vendas, faturamento e variacao", async ({ period, sales, revenue, change }) => {
    const user = userEvent.setup();
    renderHome();
    expect(screen.getByRole("heading", { name: /Quantidade de Vendas.*7 dias/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: period, exact: true }));
    expect(screen.getByText(sales, { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText(revenue, { selector: "p" })).toBeInTheDocument();
    expect(screen.getAllByText(change)).toHaveLength(2);
    expect(screen.getByRole("heading", { name: new RegExp(`^Faturamento.*${period}$`) })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: new RegExp(`^Quantidade de Vendas.*${period}$`) })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: new RegExp(`^Distribuição por Categoria.*${period}$`) })).toBeInTheDocument();
    expect(screen.getByText("5", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("calculada do catálogo")).toBeInTheDocument();
  });

  it("simula ausencia de dados sem apagar o contexto nem perder o periodo selecionado", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "30 dias", exact: true }));
    await user.click(screen.getByRole("button", { name: "Simular dashboard sem dados (primeiro acesso)" }));
    for (const message of [
      "Nenhuma venda registrada ainda", "Nenhum cliente cadastrado ainda",
      "Nenhum dado de faturamento disponível", "Sem vendas para exibir",
      "Nenhum produto vendido ainda", "Sem dados por categoria",
      "Nenhum produto cadastrado ainda", "Nenhuma venda realizada ainda",
    ]) expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByText("Ana Lima")).not.toBeInTheDocument();
    expect(screen.queryByText("R$ 12.000,00")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sair da simulação e ver dados reais" }));
    expect(screen.getByText("R$ 12.000,00")).toBeInTheDocument();
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("Chanel N°5")).toBeInTheDocument();
    expect(screen.queryByText("Modo de simulação ativo.")).not.toBeInTheDocument();
  });

  it("funcionario ve indicadores operacionais e atalhos sem faturamento, margem ou estoque", async () => {
    const user = userEvent.setup();
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, cargo: "Funcionário" } });
    renderHome();
    expect(screen.getByText("Vendas no Período")).toBeInTheDocument();
    expect(screen.queryByText("Faturamento no Período")).not.toBeInTheDocument();
    expect(screen.queryByText("Margem de Lucro")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Estoque Crítico" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vendas Recentes" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Registrar Venda/ })).toHaveAttribute("href", "/vendas/registrar");
    expect(screen.getByRole("link", { name: /Pedidos Online/ })).toHaveAttribute("href", "/vendas/pedidos");
    await user.click(screen.getByRole("button", { name: "Diário", exact: true }));
    expect(screen.getByText("20", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("Faturamento no Período")).not.toBeInTheDocument();
  });
});