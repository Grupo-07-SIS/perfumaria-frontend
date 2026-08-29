import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { executeLoginMock, useAppMock } = vi.hoisted(() => ({
  executeLoginMock: vi.fn(),
  useAppMock: vi.fn(),
}));

vi.mock("../../../app/context/AppContext", () => ({
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
      funcionarios: [
        { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: 1, nome: "Admin", senha: "admin123" },
      ],
    });
    executeLoginMock.mockResolvedValue({
      accessToken: "token-123",
      expiresAt: "2026-01-01T00:00:00.000Z",
      user: { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: 1, nome: "Admin" },
    });

    const { result } = renderHook(() => useLoginFacade());

    act(() => {
      result.current.setValue("email", " admin@canalperfumado.com.br ");
      result.current.setValue("password", "admin123");
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(executeLoginMock).toHaveBeenCalledWith({
      credentials: {
        email: " admin@canalperfumado.com.br ",
        password: "admin123",
      },
      users: [
        { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: 1, nome: "Admin", senha: "admin123" },
      ],
    });
    expect(applyAuthSession).toHaveBeenCalledWith({
      accessToken: "token-123",
      expiresAt: "2026-01-01T00:00:00.000Z",
      user: { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: 1, nome: "Admin" },
    });
    expect(result.current.authError).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("sets an auth error when authentication fails and allows password toggle", async () => {
    useAppMock.mockReturnValue({
      applyAuthSession: vi.fn(),
      funcionarios: [],
    });
    executeLoginMock.mockResolvedValue(null);

    const { result } = renderHook(() => useLoginFacade());

    act(() => {
      result.current.handleSelectAccount({
        color: "#c29958",
        email: "admin@canalperfumado.com.br",
        icon: null,
        label: "Administrador",
        senha: "admin123",
      });
      result.current.togglePasswordVisibility();
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.showPass).toBe(true);
    expect(result.current.authError).toBe("E-mail ou senha incorretos.");
  });
});