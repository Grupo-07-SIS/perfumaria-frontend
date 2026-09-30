import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import { apiClient } from "../../core/services/http-client";
import { SettingsPage } from "./SettingsPage";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn(() => null) },
}));
vi.mock("../../core/services/http-client", () => ({ apiClient: { get: vi.fn(), patch: vi.fn() } }));

function StockValue() {
  return <span data-testid="stock-limit">{useApp().stockThresholds.critico}</span>;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(sessionService.restore).mockReturnValue({
    accessToken: "test-token", expiresAt: "2099-01-01",
    user: { id: "user-1", idOrganizacao: 7, nome: "Admin", email: "admin@example.test", cargo: "Administrador" },
  });
  vi.mocked(apiClient.get).mockResolvedValue({ data: { idOrganizacao: 7, nome: "Loja", limite: 8 } });
  vi.mocked(apiClient.patch).mockResolvedValue({ data: { idOrganizacao: 7, nome: "Loja", limite: 3 } });
});

describe("Settings: caracterizacao das validacoes", () => {
  it("salva limite valido e conserva o valor ao reabrir a tela", async () => {
    const user = userEvent.setup();
    const view = render(<AppProvider><SettingsPage /></AppProvider>);
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue(8));
    expect(apiClient.get).toHaveBeenCalledWith("/organizacoes/7");
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } });
    await user.click(screen.getByRole("button", { name: "Salvar configurações" }));
    expect(await screen.findByText("Configurações de estoque salvas com sucesso!")).toBeInTheDocument();
    expect(apiClient.patch).toHaveBeenCalledWith("/organizacoes/7/limite", { limite: 3 });
    vi.mocked(apiClient.get).mockResolvedValue({ data: { idOrganizacao: 7, nome: "Loja", limite: 3 } });
    view.rerender(<AppProvider><SettingsPage key="reopened" /></AppProvider>);
    await waitFor(() => expect(screen.getByRole("spinbutton")).toBeEnabled());
    expect(screen.getByRole("spinbutton")).toHaveValue(3);
  });

  it.each(["", "0", "-1", "1.5", "2147483648"])("limite invalido '%s' nao envia requisicao nem mostra sucesso", async (value) => {
    const user = userEvent.setup();
    render(<AppProvider><SettingsPage /><StockValue /></AppProvider>);
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue(8));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value } });
    await user.click(screen.getByRole("button", { name: "Salvar configurações" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um limite inteiro entre 1 e 2147483647.");
    expect(apiClient.patch).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByTestId("stock-limit")).toHaveTextContent("8");
  });

  it("mantem o limite anterior enquanto salva e usa o valor confirmado pelo backend", async () => {
    let resolvePatch!: (response: unknown) => void;
    vi.mocked(apiClient.patch).mockImplementation(() => new Promise((resolve) => { resolvePatch = resolve; }));
    render(<AppProvider><SettingsPage /><StockValue /></AppProvider>);
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue(8));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar configurações" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "Salvando..." }));
    expect(apiClient.patch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
    expect(screen.getByTestId("stock-limit")).toHaveTextContent("8");
    await act(async () => { resolvePatch({ data: { idOrganizacao: 7, nome: "Loja", limite: 10 } }); });
    expect(screen.getByTestId("stock-limit")).toHaveTextContent("10");
  });

  it.each([400, 401, 403, 404, 500])("trata erro HTTP %s ao salvar e permite repetir", async (status) => {
    vi.mocked(apiClient.patch).mockRejectedValueOnce({ isAxiosError: true, response: { status } });
    render(<AppProvider><SettingsPage /><StockValue /></AppProvider>);
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue(8));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar configurações" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("stock-limit")).toHaveTextContent("8");
    expect(screen.getByRole("spinbutton")).toHaveValue(3);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar configurações" }));
    await screen.findByText("Configurações de estoque salvas com sucesso!");
    expect(screen.getByTestId("stock-limit")).toHaveTextContent("3");
  });

  it("permite repetir o carregamento sem salvar um valor local como se fosse remoto", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("offline"));
    render(<AppProvider><SettingsPage /></AppProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar o limite de estoque.");
    expect(screen.getByRole("button", { name: "Salvar configurações" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue(8));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("nao escolhe uma organizacao arbitraria para sessoes antigas", async () => {
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, idOrganizacao: undefined } });
    render(<AppProvider><SettingsPage /></AppProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Organização não identificada. Entre novamente.");
    expect(apiClient.get).not.toHaveBeenCalled();
    expect(apiClient.patch).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Salvar configurações" })).toBeDisabled();
  });

  it("exige senha atual, minimo de seis caracteres e confirmacao antes de limpar campos", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SettingsPage /></AppProvider>);
    await user.click(screen.getByRole("button", { name: "Segurança" }));
    await user.click(screen.getByRole("button", { name: "Alterar senha", exact: true }));
    expect(screen.getByText("Informe a senha atual.")).toBeInTheDocument();
    expect(screen.getByText("Informe a nova senha.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Senha atual", { exact: true }), "senha-teste");
    await user.type(screen.getByLabelText("Nova senha", { exact: true }), "12345");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "diferente");
    await user.click(screen.getByRole("button", { name: "Alterar senha", exact: true }));
    expect(screen.getByText("Mínimo de 6 caracteres.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Nova senha", { exact: true }), "6");
    await user.clear(screen.getByLabelText("Confirmar nova senha"));
    await user.type(screen.getByLabelText("Confirmar nova senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Alterar senha", exact: true }));
    expect(screen.getByRole("status")).toHaveTextContent("Senha alterada com sucesso!");
    expect(screen.getByLabelText("Senha atual", { exact: true })).toHaveValue("");
    expect(screen.getByLabelText("Nova senha", { exact: true })).toHaveValue("");
    expect(screen.getByLabelText("Confirmar nova senha")).toHaveValue("");
  });

  it("exige email valido, confirmacao igual e senha antes de informar sucesso local", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SettingsPage /></AppProvider>);
    await user.click(screen.getByRole("button", { name: "Segurança" }));
    const save = screen.getByRole("button", { name: /Alterar e-mail/ });
    await user.click(save);
    expect(screen.getByText("Informe o novo e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Confirme com sua senha atual.")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("novo@canalperfumado.com.br"), "invalido");
    await user.type(screen.getByPlaceholderText("Repita o novo e-mail"), "outro@example.test");
    await user.click(save);
    expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
    expect(screen.getByText("Os e-mails não coincidem.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText("novo@canalperfumado.com.br"));
    await user.type(screen.getByPlaceholderText("novo@canalperfumado.com.br"), "outro@example.test");
    await user.type(screen.getByLabelText(/Senha atual \(confirmação\)/), "senha-teste");
    await user.click(save);
    expect(screen.getByRole("status")).toHaveTextContent("E-mail de acesso alterado com sucesso!");
    expect(screen.getByPlaceholderText("novo@canalperfumado.com.br")).toHaveValue("");
    expect(screen.getByPlaceholderText("Repita o novo e-mail")).toHaveValue("");
    expect(screen.getByLabelText(/Senha atual \(confirmação\)/)).toHaveValue("");
  });
});
