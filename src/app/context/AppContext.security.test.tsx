import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { restore, clear, logout, getStatus } = vi.hoisted(() => ({ restore: vi.fn(), clear: vi.fn(), logout: vi.fn(), getStatus: vi.fn() }));
vi.mock("../../core/auth/session.service", async importOriginal => {
  const original = await importOriginal<typeof import("../../core/auth/session.service")>();
  return { sessionService: { ...original.sessionService, restore, clear } };
});
vi.mock("../../core/services/auth.service", () => ({ authService: { logout } }));
vi.mock("../../core/services/security-questions-status.service", () => ({ getSecurityQuestionsStatus: getStatus }));
vi.mock("../../core/logging/logger", () => ({ logger: { info: vi.fn() } }));
import { AppProvider, useApp } from "./AppContext";
import type { AuthSession } from "../../core/auth/auth.types";

const session: AuthSession = { accessToken: "test-only", expiresAt: new Date(Date.now() + 3600000).toISOString(), user: { id: "a", email: "a@example.com", nome: "Ana", cargo: "Funcionário" } };
function Host() {
  const app = useApp();
  return <>
    <p>{app.isLoggedIn ? "Logado" : "Deslogado"}</p>
    <p>{app.securityQuestions.phase}</p>
    <p>{app.securityQuestions.warningVisible ? "Aviso visível" : "Sem aviso"}</p>
    <button onClick={() => app.applyAuthSession(session)}>Login</button>
    <button onClick={() => void app.logout()}>Logout</button>
  </>;
}
beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); restore.mockReturnValue(null); logout.mockResolvedValue(undefined); getStatus.mockResolvedValue({ quantidade: 0, completo: false }); });
describe("AppProvider — ciclo real da segurança", () => {
  it("consulta status depois de applyAuthSession sem bloquear login", async () => {
    getStatus.mockRejectedValue(new Error("offline"));
    render(<AppProvider><Host /></AppProvider>);
    expect(getStatus).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Login"));
    expect(screen.getByText("Logado")).toBeInTheDocument();
    await screen.findByText("unavailable");
    expect(screen.getByText("Sem aviso")).toBeInTheDocument();
    expect(clear).not.toHaveBeenCalled();
  });
  it("consulta sessão restaurada uma vez e ignora resposta após logout", async () => {
    restore.mockReturnValue(session);
    let resolve!: (value: { quantidade: number; completo: boolean }) => void;
    getStatus.mockReturnValue(new Promise(done => { resolve = done; }));
    render(<AppProvider><Host /></AppProvider>);
    await waitFor(() => expect(getStatus).toHaveBeenCalledOnce());
    await act(async () => { fireEvent.click(screen.getByText("Logout")); });
    await act(async () => { resolve({ quantidade: 0, completo: false }); });
    expect(screen.getByText("Deslogado")).toBeInTheDocument();
    expect(screen.getByText("Sem aviso")).toBeInTheDocument();
    expect(sessionStorage.getItem("peract.security-warning-session")).toBeNull();
    expect(restore).toHaveBeenCalledOnce();
  });
});