import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";

vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: (props: React.ComponentProps<typeof original.ResponsiveContainer>) => (
      <original.ResponsiveContainer {...props} initialDimension={{ width: 800, height: 220 }} />
    ),
  };
});

describe("Dashboard: caracterizacao dos periodos", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("inicia em sete dias e troca rotulos mantendo os indicadores demonstrativos atuais", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getAllByText("Últimos 7 dias", { selector: "span" })).toHaveLength(3);
    for (const period of ["Hoje", "Últimos 30 dias", "Últimos 7 dias"]) {
      await user.click(screen.getByRole("button", { name: period, exact: true }));
      for (const title of ["Faturamento", "Quantidade de Vendas", "Distribuição por Categoria"]) {
        expect(screen.getByRole("heading", { name: title, exact: true }).parentElement).toHaveTextContent(period);
      }
      expect(screen.getByLabelText("Vendas no período: 50")).toBeInTheDocument();
      expect(screen.getByLabelText("Faturamento estimado: R$ 5.370")).toBeInTheDocument();
      expect(screen.getByLabelText("Estoque crítico: 3")).toBeInTheDocument();
    }
  });

  it("oferece atalhos para estoque critico e registro de venda", () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByRole("status")).toHaveTextContent("3 produtos com estoque abaixo do mínimo.");
    expect(screen.getByRole("link", { name: /Ver produtos críticos/ })).toHaveAttribute("href", "/estoque/produtos");
    expect(screen.getByRole("link", { name: "Ver todos" })).toHaveAttribute("href", "/estoque/produtos");
    expect(screen.getByRole("link", { name: "Registrar venda" })).toHaveAttribute("href", "/vendas/registrar");
  });
});