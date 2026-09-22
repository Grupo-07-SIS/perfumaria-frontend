import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import { SalesPage } from "../sales/SalesPage";
import { PeoplePage } from "./PeoplePage";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn() },
}));
vi.mock("../../core/services/botpress", () => ({
  triggerBotpressPresencialFlow: vi.fn().mockResolvedValue(undefined),
}));

describe("People: caracterizacao de filtros e permissoes", () => {
  beforeEach(() => {
    vi.mocked(sessionService.restore).mockReturnValue({
      accessToken: "test-only", expiresAt: "2099-01-01T00:00:00Z",
      user: { id: "qa-admin", nome: "Admin teste", email: "admin@example.test", cargo: "Administrador" },
    });
  });

  it("busca clientes por nome sem diferenciar maiusculas e por telefone", async () => {
    const user = userEvent.setup();
    render(<AppProvider><PeoplePage /></AppProvider>);
    const search = screen.getByPlaceholderText("Buscar cliente...");
    await user.type(search, "ANA LIMA");
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Mendes")).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "98888-2222");
    expect(screen.getByText("Carlos Mendes")).toBeInTheDocument();
    expect(screen.queryByText("Ana Lima")).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "inexistente");
    expect(screen.getByText("Nenhum cliente encontrado.")).toBeInTheDocument();
    await user.clear(search);
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
  });

  it("funcionario gerencia clientes sem acesso as abas administrativas", async () => {
    const user = userEvent.setup();
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, cargo: "Funcionário" } });
    render(<AppProvider><PeoplePage /></AppProvider>);
    expect(screen.queryByRole("button", { name: /^Fornecedores/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Funcionários/ })).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Novo cliente" })[0]);
    expect(screen.getByRole("dialog", { name: "Novo Cliente" })).toBeInTheDocument();
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
    expect(screen.getAllByText("Obrigatório.")).toHaveLength(2);
    await user.type(screen.getByPlaceholderText("Ex: Ana Lima"), "Cliente teste");
    await user.type(screen.getByPlaceholderText("(11) 99999-9999"), "11912345678");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Cliente teste")).toBeInTheDocument();
  });

  it("admin busca fornecedor por email e funcionario por cargo, limpando busca ao trocar aba", async () => {
    const user = userEvent.setup();
    render(<AppProvider><PeoplePage /></AppProvider>);
    await user.type(screen.getByPlaceholderText("Buscar cliente..."), "inexistente");
    await user.click(screen.getByRole("button", { name: /^Fornecedores/ }));
    expect(screen.getByPlaceholderText("Buscar fornecedor...")).toHaveValue("");
    await user.type(screen.getByPlaceholderText("Buscar fornecedor..."), "vendas@fracsosbr.com.br");
    expect(screen.getByText("FrascosBR Ltda")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Editar", exact: true })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /^Funcionários/ }));
    expect(screen.getByPlaceholderText("Buscar funcionário...")).toHaveValue("");
    await user.type(screen.getByPlaceholderText("Buscar funcionário..."), "ADMINISTRADOR");
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows.length).toBeGreaterThan(0);
    const roleColumn = within(screen.getByRole("table")).getAllByRole("columnheader").findIndex(header => header.textContent === "Cargo");
    for (const row of rows) expect(within(row).getAllByRole("cell")[roleColumn]).toHaveTextContent(/^Administrador$/);
    await user.clear(screen.getByPlaceholderText("Buscar funcionário..."));
    await user.type(screen.getByPlaceholderText("Buscar funcionário..."), "inexistente");
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(1);
  });

  it("exige confirmacao para inativar, combina status e busca e permite reativar", async () => {
    const user = userEvent.setup();
    render(<AppProvider><PeoplePage /></AppProvider>);
    await user.type(screen.getByPlaceholderText("Buscar cliente..."), "Ana Lima");
    await user.click(screen.getByRole("button", { name: "Inativar cliente" }));
    await user.click(within(screen.getByRole("dialog", { name: "Inativar Cliente" })).getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Inativar cliente" }));
    await user.click(within(screen.getByRole("dialog", { name: "Inativar Cliente" })).getByRole("button", { name: "Inativar", exact: true }));
    expect(screen.queryByText("Ana Lima")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Ativos/ })).toHaveTextContent("4");
    await user.click(screen.getByRole("button", { name: /^Inativos/ }));
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("Inativo", { exact: true })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reativar cliente" }));
    expect(screen.getByText("Nenhum cliente inativo.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Ativos/ }));
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("Ativo", { exact: true })).toBeInTheDocument();
  });

  it("cliente inativado deixa de ser oferecido na busca do PDV", async () => {
    const user = userEvent.setup();
    const view = render(<AppProvider><PeoplePage /></AppProvider>);
    await user.type(screen.getByPlaceholderText("Buscar cliente..."), "Ana Lima");
    await user.click(screen.getByRole("button", { name: "Inativar cliente" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Inativar", exact: true }));
    view.rerender(<AppProvider><SalesPage /></AppProvider>);
    await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Ana Lima");
    expect(screen.getByText("Nenhum cliente encontrado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ana Lima/ })).not.toBeInTheDocument();
  });

  it("descarta edicao cancelada e restaura os dados do cliente ao reabrir", () => {
    render(<AppProvider><PeoplePage /></AppProvider>);
    fireEvent.change(screen.getByPlaceholderText("Buscar cliente..."), { target: { value: "Ana Lima" } });
    fireEvent.click(screen.getByRole("button", { name: "Editar", exact: true }));
    fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Rascunho descartado" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar", exact: true }));
    expect(screen.getByPlaceholderText("Ex: Ana Lima")).toHaveValue("Ana Lima");
    fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Ana revisada" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
    fireEvent.change(screen.getByPlaceholderText("Buscar cliente..."), { target: { value: "Ana revisada" } });
    expect(screen.getByText("Ana revisada")).toBeInTheDocument();
  });

  it.fails("risco preexistente: fechamento atrasado nao deveria fechar um novo cadastro", () => {
    vi.useFakeTimers();
    try {
      render(<AppProvider><PeoplePage /></AppProvider>);
      fireEvent.click(screen.getAllByRole("button", { name: "Novo cliente" })[0]);
      fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Cliente salvo" } });
      fireEvent.change(screen.getByPlaceholderText("(11) 99999-9999"), { target: { value: "11912345678" } });
      fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      fireEvent.click(screen.getAllByRole("button", { name: "Novo cliente" })[0]);
      fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Segundo cadastro" } });
      act(() => vi.advanceTimersByTime(1200));
      expect(screen.getByRole("dialog", { name: "Novo Cliente" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ex: Ana Lima")).toHaveValue("Segundo cadastro");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});