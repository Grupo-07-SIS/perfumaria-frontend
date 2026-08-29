import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticateMock, saveSessionMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  saveSessionMock: vi.fn(),
}));

vi.mock("../../../core/services/auth.service", () => ({
  authService: {
    saveSession: saveSessionMock,
  },
}));

vi.mock("../repository/login.repository", () => ({
  loginRepository: {
    authenticate: authenticateMock,
  },
}));

import { executeLogin, hasAuthenticatedSession } from "./login.service";

describe("loginService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveSessionMock.mockImplementation((session) => ({
      ...session,
      expiresAt: "2026-01-01T00:00:00.000Z",
    }));
  });

  it("waits, authenticates and persists the mapped session", async () => {
    vi.useFakeTimers();
    authenticateMock.mockResolvedValue({
      accessToken: "token-123",
      expiresIn: 3600,
      tokenType: "Bearer",
      usuario: {
        email: "admin@canalperfumado.com.br",
        id: "uuid-1",
        nome: "Admin",
        tipoUsuario: "ADMIN",
      },
    });

    const authPromise = executeLogin({
      credentials: {
        email: "  admin@canalperfumado.com.br  ",
        password: "admin123",
      },
    });

    await vi.advanceTimersByTimeAsync(700);
    const session = await authPromise;

    expect(authenticateMock).toHaveBeenCalledWith({
      credentials: {
        email: "admin@canalperfumado.com.br",
        senha: "admin123",
      },
    });
    expect(saveSessionMock).toHaveBeenCalledWith({
      accessToken: "token-123",
      expiresIn: 3600,
      user: {
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: "uuid-1",
        nome: "Admin",
      },
    });
    expect(session).toMatchObject({
      accessToken: "token-123",
      user: {
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: "uuid-1",
        nome: "Admin",
      },
    });

    vi.useRealTimers();
  });

  it("reports whether an authenticated session exists", () => {
    expect(hasAuthenticatedSession(null)).toBe(false);
    expect(
      hasAuthenticatedSession({
        accessToken: "token-123",
        expiresAt: "2026-01-01T00:00:00.000Z",
        user: { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: "uuid-1", nome: "Admin" },
      }),
    ).toBe(true);
  });
});