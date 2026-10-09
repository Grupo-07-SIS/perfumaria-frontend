import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { executeLoginMock, useAppMock } = vi.hoisted(() => ({
  executeLoginMock: vi.fn(),
  useAppMock: vi.fn(),
}));

vi.mock("../../../core/store/AppContext", () => ({
  useApp: useAppMock,
}));

vi.mock("../services/login.service", () => ({
  executeLogin: executeLoginMock,
  hasAuthenticatedSession: (session: unknown) => Boolean(session),
}));

import { useLoginFacade } from "./useLoginFacade";

describe("useLoginFacade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies the authenticated session on successful submit", async () => {
    const applyAuthSession = vi.fn();

    useAppMock.mockReturnValue({
      applyAuthSession,
    });
    executeLoginMock.mockResolvedValue({
      accessToken: "token-123",
      expiresAt: "2026-01-01T00:00:00.000Z",
      user: { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: "uuid-1", nome: "Admin" },
    });

    const { result } = renderHook(() => useLoginFacade());

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(executeLoginMock).toHaveBeenCalledWith({
      credentials: {
        email: "",
        password: "",
      },
    });
    expect(applyAuthSession).toHaveBeenCalledWith({
      accessToken: "token-123",
      expiresAt: "2026-01-01T00:00:00.000Z",
      user: { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: "uuid-1", nome: "Admin" },
    });
    expect(result.current.authError).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("sets an auth error when authentication fails and allows password toggle", async () => {
    useAppMock.mockReturnValue({
      applyAuthSession: vi.fn(),
    });
    executeLoginMock.mockResolvedValue(null);

    const { result } = renderHook(() => useLoginFacade());

    act(() => {
      result.current.togglePasswordVisibility();
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.showPass).toBe(true);
    expect(result.current.authError).toBe("E-mail ou senha incorretos.");
  });

  it("shows clear login guidance when the request throws", async () => {
    useAppMock.mockReturnValue({
      applyAuthSession: vi.fn(),
    });
    executeLoginMock.mockRejectedValue(new Error("offline"));

    const { result } = renderHook(() => useLoginFacade());

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.authError).toBe("Não foi possível entrar agora. Verifique sua conexão e tente novamente.");
  });
});