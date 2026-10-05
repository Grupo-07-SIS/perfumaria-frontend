import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import { SalesHistoryPage } from "./SalesHistoryPage";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn() },
}));

function saleRow(id: string) {
  return within(screen.getByRole("table")).getByRole("row", { name: new RegExp(id) });
}

describe("SalesHistory: caracterizacao do historico", () => {
  beforeEach(() => {
    vi.mocked(sessionService.restore).mockReturnValue({
      accessToken: "test-only", expiresAt: "2099-01-01T00:00:00Z",
      user: { id: "qa-admin", nome: "Admin teste", email: "admin@example.test", cargo: "Administrador" },
    });
  });

  it("omite pendentes e combina canal, pagamento e busca sem alterar os registros", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    expect(screen.queryByRole("cell", { name: "V-1042" })).not.toBeInTheDocument();
    expect(saleRow("V-1040")).toHaveTextContent("Finalizado");
    await user.click(screen.getByRole("button", { name: "Presencial", exact: true }));
    await user.selectOptions(screen.getByRole("combobox"), "Dinheiro");
    expect(saleRow("V-1039")).toHaveTextContent("Pedro Alves");
    expect(screen.queryByRole("cell", { name: "V-1041" })).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Buscar venda ou cliente..."), "inexistente");
    expect(within(screen.getByRole("table")).getByText("Nenhuma venda encontrada.")).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText("Buscar venda ou cliente..."));
    expect(saleRow("V-1039")).toBeInTheDocument();
  });

  it("funcionario consulta vendas sem editar nem visualizar faturamento", () => {
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, cargo: "Funcionário" } });
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    expect(saleRow("V-1041")).toHaveTextContent("Carlos Mendes");
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByText("Faturamento")).not.toBeInTheDocument();
  });

  it("admin pode descartar edicao ou salvar pagamento e cancelamento preservando o recibo", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    const initialRevenue = screen.getByText("Faturamento").parentElement?.textContent;
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Editar" }));
    let dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    expect(dialog.queryByRole("button", { name: "Pendente", exact: true })).not.toBeInTheDocument();
    await user.selectOptions(dialog.getByRole("combobox"), "Pix");
    await user.click(dialog.getAllByRole("button", { name: "Fechar", exact: true })[0]);
    expect(saleRow("V-1041")).toHaveTextContent("Cartão de crédito");
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Editar" }));
    dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    await user.selectOptions(dialog.getByRole("combobox"), "Pix");
    await user.click(dialog.getByRole("button", { name: "Cancelado", exact: true }));
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    expect(saleRow("V-1041")).toHaveTextContent("Cancelado");
    expect(saleRow("V-1041")).toHaveTextContent("Pix");
    expect(saleRow("V-1041")).toHaveTextContent("R$ 156,00");
    expect(screen.getByText("Faturamento").parentElement?.textContent).not.toBe(initialRevenue);
    expect(screen.getByText("Faturamento").parentElement).toHaveTextContent("R$ 645");
    await user.click(screen.getByRole("button", { name: "Cancelado", exact: true }));
    expect(screen.queryByRole("cell", { name: "V-1040" })).not.toBeInTheDocument();
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Ver recibo" }));
    expect(screen.getByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("Carlos Mendes");
    expect(screen.getByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("Decant Creed Aventus 3ml");
    expect(screen.getByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("Cancelado");
  });

  it("retirar a finalizacao de venda online remove a venda do historico", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await user.click(within(saleRow("V-1040")).getByRole("button", { name: "Editar" }));
    const dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    await user.click(dialog.getByRole("button", { name: "Pendente", exact: true }));
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    expect(screen.queryByRole("cell", { name: "V-1040" })).not.toBeInTheDocument();
  });
});