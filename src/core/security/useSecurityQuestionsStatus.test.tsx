import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { getStatus } = vi.hoisted(() => ({ getStatus: vi.fn() }));
vi.mock("../services/security-questions-status.service", () => ({ getSecurityQuestionsStatus: getStatus }));
import { useSecurityQuestionsStatus } from "./useSecurityQuestionsStatus";
import { SecurityHttpError } from "../services/security-http";

beforeEach(() => { sessionStorage.clear(); vi.clearAllMocks(); });
describe("Aviso por usuário e sessão autenticada", () => {
  it("mantém fechamento no refresh, mas novo login reinicia preferência", async () => {
    getStatus.mockResolvedValue({ quantidade: 0, completo: false });
    const first = renderHook(() => useSecurityQuestionsStatus("user-a", vi.fn()));
    await waitFor(() => expect(first.result.current.state.warningVisible).toBe(true));
    act(() => first.result.current.dismiss());
    const firstSession = JSON.parse(sessionStorage.getItem("peract.security-warning-session")!);
    expect(Object.keys(firstSession).sort()).toEqual(["dismissed", "sessionId", "shown", "userId"]);
    first.unmount();
    const restored = renderHook(() => useSecurityQuestionsStatus("user-a", vi.fn()));
    await waitFor(() => expect(restored.result.current.state.phase).toBe("ready"));
    expect(restored.result.current.state.warningVisible).toBe(false);
    act(() => restored.result.current.beginSession("user-a"));
    await waitFor(() => expect(restored.result.current.state.warningVisible).toBe(true));
    expect(JSON.parse(sessionStorage.getItem("peract.security-warning-session")!).sessionId).not.toBe(firstSession.sessionId);
  });
  it("cadastro completo muda texto/estado sem fechar aviso; próximo login completo não mostra", async () => {
    getStatus.mockResolvedValue({ quantidade: 0, completo: false });
    const { result } = renderHook(() => useSecurityQuestionsStatus("user-a", vi.fn()));
    await waitFor(() => expect(result.current.state.warningVisible).toBe(true));
    getStatus.mockResolvedValue({ quantidade: 3, completo: true });
    await act(() => result.current.refresh());
    expect(result.current.state).toMatchObject({ complete: true, warningVisible: true });
    act(() => result.current.beginSession("user-a"));
    await waitFor(() => expect(result.current.state.phase).toBe("ready"));
    expect(result.current.state.warningVisible).toBe(false);
  });
  it("ignora resposta pendente após logout e limpa preferência", async () => {
    let resolve!: (value: { quantidade: number; completo: boolean }) => void;
    getStatus.mockReturnValue(new Promise(done => { resolve = done; }));
    const { result, rerender } = renderHook(({ user }) => useSecurityQuestionsStatus(user, vi.fn()), { initialProps: { user: "a" as string | undefined } });
    act(() => result.current.endSession());
    rerender({ user: undefined });
    await act(async () => { resolve({ quantidade: 0, completo: false }); });
    expect(result.current.state.warningVisible).toBe(false);
    expect(sessionStorage.getItem("peract.security-warning-session")).toBeNull();
  });
  it("reload após cadastro completo não fecha card que já estava visível", async () => {
    getStatus.mockResolvedValue({ quantidade: 0, completo: false });
    const first = renderHook(() => useSecurityQuestionsStatus("a", vi.fn()));
    await waitFor(() => expect(first.result.current.state.warningVisible).toBe(true));
    act(() => first.result.current.markComplete()); first.unmount();
    getStatus.mockResolvedValue({ quantidade: 3, completo: true });
    const restored = renderHook(() => useSecurityQuestionsStatus("a", vi.fn()));
    await waitFor(() => expect(restored.result.current.state.phase).toBe("ready"));
    expect(restored.result.current.state).toMatchObject({ complete: true, warningVisible: true });
  });
  it("troca de usuário não herda fechamento nem resultados antigos", async () => {
    let resolveA!: (value: { quantidade: number; completo: boolean }) => void;
    getStatus.mockReturnValueOnce(new Promise(done => { resolveA = done; })).mockResolvedValue({ quantidade: 3, completo: true });
    const { result, rerender } = renderHook(({ user }) => useSecurityQuestionsStatus(user, vi.fn()), { initialProps: { user: "a" } });
    act(() => result.current.beginSession("b")); rerender({ user: "b" });
    await waitFor(() => expect(result.current.state.complete).toBe(true));
    await act(async () => { resolveA({ quantidade: 0, completo: false }); });
    expect(result.current.state.warningVisible).toBe(false);
    expect(JSON.parse(sessionStorage.getItem("peract.security-warning-session")!).userId).toBe("b");
  });
  it("falha de rede não presume ausência nem bloqueia login", async () => {
    const unauthorized = vi.fn(); getStatus.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useSecurityQuestionsStatus("a", unauthorized));
    await waitFor(() => expect(result.current.state.phase).toBe("unavailable"));
    expect(result.current.state).toMatchObject({ complete: null, warningVisible: false });
    expect(unauthorized).not.toHaveBeenCalled();
  });
  it("401 invalida sessão, sem registrar credenciais", async () => {
    const unauthorized = vi.fn(); getStatus.mockRejectedValue(new SecurityHttpError(401, "Sessão inválida"));
    renderHook(() => useSecurityQuestionsStatus("a", unauthorized));
    await waitFor(() => expect(unauthorized).toHaveBeenCalledOnce());
    expect(sessionStorage.getItem("peract.security-warning-session")).toBeNull();
  });
});