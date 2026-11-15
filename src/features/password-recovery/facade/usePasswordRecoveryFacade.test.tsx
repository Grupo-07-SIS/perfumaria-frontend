import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { actionToast } from "../../../shared/services/action-toast";
vi.mock("../../../shared/services/action-toast", () => ({ actionToast: { success: vi.fn(), error: vi.fn() } }));
const { start, verify, reset } = vi.hoisted(() => ({ start: vi.fn(), verify: vi.fn(), reset: vi.fn() }));
vi.mock("../services/password-recovery.service", () => ({ passwordRecoveryService: { start, verify, reset } }));
import { usePasswordRecoveryFacade } from "./usePasswordRecoveryFacade";

beforeEach(() => vi.clearAllMocks());
describe("Recovery state machine e concorrência local", () => {
  it("não permite verificar/redefinir antes de iniciar", async () => {
    const { result } = renderHook(usePasswordRecoveryFacade);
    await act(async () => { await result.current.verify([]); await result.current.reset({ novaSenha: "password", confirmacao: "password" }); });
    expect(verify).not.toHaveBeenCalled(); expect(reset).not.toHaveBeenCalled();
    expect(result.current.state).toEqual({ step: "email" });
    expect(actionToast.success).not.toHaveBeenCalled();
    expect(actionToast.error).not.toHaveBeenCalled();
  });
  it("ignora iniciação antiga após cancelar; duplo submit chama serviço uma vez", async () => {
    let resolve!: (value: unknown) => void;
    start.mockReturnValue(new Promise(done => { resolve = done; }));
    const { result } = renderHook(usePasswordRecoveryFacade);
    let pending!: Promise<void>;
    act(() => { pending = result.current.start("user@example.com"); });
    await act(async () => { await result.current.start("user@example.com"); });
    expect(start).toHaveBeenCalledOnce();
    act(() => result.current.restart());
    await act(async () => { resolve({ token: "stale-test", expiresAt: new Date(Date.now() + 600000).toISOString(), questions: [] }); await pending; });
    expect(result.current.state).toEqual({ step: "email" });
    expect(result.current.loading).toBe(false);
  });
  it("token de desafio é substituído, sucesso e restart não retêm capabilities", async () => {
    const expiresAt = new Date(Date.now() + 600000).toISOString();
    start.mockResolvedValue({ token: "challenge-test", expiresAt, questions: [] });
    verify.mockResolvedValue({ token: "reset-test", expiresAt }); reset.mockResolvedValue(undefined);
    const { result } = renderHook(usePasswordRecoveryFacade);
    await act(async () => { await result.current.start("user@example.com"); });
    await act(async () => { await result.current.verify([]); });
    expect(result.current.state.step).toBe("password");
    expect(JSON.stringify(result.current.state)).not.toContain("challenge-test");
    expect(actionToast.success).not.toHaveBeenCalled();
    await act(async () => { await result.current.reset({ novaSenha: "password", confirmacao: "password" }); });
    expect(result.current.state).toEqual({ step: "success" });
    expect(actionToast.success).toHaveBeenCalledExactlyOnceWith("Senha redefinida com sucesso!", "Entre com sua nova senha para acessar o sistema.");
    act(() => result.current.restart());
    expect(result.current.state).toEqual({ step: "email" });
  });
  it("preserva o erro inline e emite um único toast quando a recuperação falha", async () => {
    start.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(usePasswordRecoveryFacade);
    await act(async () => { await result.current.start("user@example.com"); });
    expect(result.current.error).toBeTruthy();
    expect(actionToast.error).toHaveBeenCalledExactlyOnceWith("Não foi possível continuar a recuperação.");
    expect(actionToast.success).not.toHaveBeenCalled();
  });
});