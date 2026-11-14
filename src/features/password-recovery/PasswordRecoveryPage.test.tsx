import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { start, verify, reset } = vi.hoisted(() => ({ start: vi.fn(), verify: vi.fn(), reset: vi.fn() }));
vi.mock("./services/password-recovery.service", () => ({ passwordRecoveryService: { start, verify, reset } }));
import { PasswordRecoveryPage } from "./PasswordRecoveryPage";
import { SecurityHttpError } from "../../core/services/security-http";

function renderRecovery() { return render(<MemoryRouter initialEntries={["/recuperar-senha"]}><PasswordRecoveryPage /></MemoryRouter>); }
const fillEmail = () => {
  fireEvent.change(screen.getByLabelText(/^E-mail da conta/, { selector: "input" }), { target: { value: "user@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
};
beforeEach(() => {
  vi.clearAllMocks(); sessionStorage.clear();
  const expiresAt = new Date(Date.now() + 600000).toISOString();
  start.mockResolvedValue({ token: "challenge-test", expiresAt, questions: [1, 2, 3].map(ordem => ({ ordem, pergunta: `Texto ${ordem}` })) });
  verify.mockResolvedValue({ token: "reset-test", expiresAt }); reset.mockResolvedValue(undefined);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe("Recuperação — email → respostas → senha → sucesso", () => {
  it("mostra perguntas readonly, mascara respostas, preserva conteúdo e não autentica automaticamente", async () => {
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");
    renderRecovery(); fillEmail();
    await screen.findByRole("button", { name: "Verificar respostas" });
    expect(screen.getByLabelText("Texto da pergunta 1")).toHaveAttribute("readonly");
    for (const ordem of [1, 2, 3]) {
      const input = screen.getByLabelText(new RegExp(`^Resposta ${ordem}`), { selector: "input" });
      expect(input).toHaveAttribute("type", "password");
      fireEvent.change(input, { target: { value: " João, Silva. " } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Mostrar Resposta 1" }));
    expect(screen.getByLabelText(/^Resposta 1/, { selector: "input" })).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/^Resposta 2/, { selector: "input" })).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Verificar respostas" }));
    await screen.findByRole("button", { name: "Redefinir senha" });
    expect(verify.mock.calls[0][1]).toEqual([1, 2, 3].map(ordem => ({ ordem, resposta: " João, Silva. " })));
    expect(screen.queryByLabelText(/^Resposta 1/, { selector: "input" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^Nova senha/, { selector: "input" }), { target: { value: " senha nova " } });
    fireEvent.change(screen.getByLabelText(/^Confirmar nova senha/, { selector: "input" }), { target: { value: " senha nova " } });
    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));
    await screen.findByText(/Senha redefinida com sucesso/);
    expect(reset).toHaveBeenCalledWith(expect.objectContaining({ token: "reset-test" }), { novaSenha: " senha nova ", confirmacao: " senha nova " });
    expect(screen.getByRole("link", { name: "Voltar ao login" })).toHaveAttribute("href", "/login");
    expect(storageSpy).not.toHaveBeenCalled(); storageSpy.mockRestore();
    expect(document.body.textContent).not.toContain("challenge-test");
    expect(document.body.textContent).not.toContain("reset-test");
  });
  it("voltar limpa etapa, respostas e autorização; não aceita pular para senha", async () => {
    renderRecovery(); fillEmail();
    await screen.findByRole("button", { name: "Verificar respostas" });
    fireEvent.change(screen.getByLabelText(/^Resposta 1/, { selector: "input" }), { target: { value: "segredo" } });
    fireEvent.click(screen.getByRole("button", { name: "Voltar e reiniciar" }));
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Redefinir senha" })).not.toBeInTheDocument();
    fillEmail(); await screen.findByRole("button", { name: "Verificar respostas" });
    expect(screen.getByLabelText(/^Resposta 1/, { selector: "input" })).toHaveValue("");
  });
  it("429 exibe Retry-After e não reinicia contador localmente", async () => {
    start.mockRejectedValue(new SecurityHttpError(429, "Aguarde.", "28800"));
    renderRecovery(); fillEmail();
    expect(await screen.findByRole("alert")).toHaveTextContent("28800 segundos");
    expect(screen.getByRole("alert")).toHaveTextContent("8 horas");
  });
  it("expiração limpa autorização e volta ao email", async () => {
    vi.useFakeTimers();
    renderRecovery();
    await act(async () => { fillEmail(); });
    expect(screen.getByRole("button", { name: "Verificar respostas" })).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(600001); });
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/expirou/);
  });
  it("respostas incorretas produzem erro único, não revelam pergunta", async () => {
    verify.mockRejectedValue(new SecurityHttpError(401, "Detalhe que não deve ser exibido"));
    renderRecovery(); fillEmail(); await screen.findByRole("button", { name: "Verificar respostas" });
    for (const ordem of [1, 2, 3]) fireEvent.change(screen.getByLabelText(new RegExp(`^Resposta ${ordem}`), { selector: "input" }), { target: { value: "answer" } });
    fireEvent.click(screen.getByRole("button", { name: "Verificar respostas" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Confira as três respostas exatas"));
    expect(screen.queryByText("Detalhe que não deve ser exibido")).not.toBeInTheDocument();
  });
});