import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { SettingsPage } from "./SettingsPage";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn(() => null) },
}));

describe("Settings: caracterizacao das validacoes", () => {
  it("salva limite valido e conserva o valor ao reabrir a tela", async () => {
    const user = userEvent.setup();
    const view = render(<AppProvider><SettingsPage /></AppProvider>);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } });
    await user.click(screen.getByRole("button", { name: "Salvar configurações" }));
    expect(screen.getByRole("status")).toHaveTextContent("Configurações de estoque salvas com sucesso!");
    view.rerender(<AppProvider><SettingsPage key="reopened" /></AppProvider>);
    expect(screen.getByRole("spinbutton")).toHaveValue(3);
  });

  it.each(["", "0", "-1"])("limite invalido '%s' nao persiste apesar do feedback atual de sucesso", async (value) => {
    const user = userEvent.setup();
    const view = render(<AppProvider><SettingsPage /></AppProvider>);
    const previousValue = (screen.getByRole("spinbutton") as HTMLInputElement).valueAsNumber;
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value } });
    await user.click(screen.getByRole("button", { name: "Salvar configurações" }));
    expect(screen.getByRole("status")).toHaveTextContent("Configurações de estoque salvas com sucesso!");
    view.rerender(<AppProvider><SettingsPage key="reopened" /></AppProvider>);
    expect(screen.getByRole("spinbutton")).toHaveValue(previousValue);
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