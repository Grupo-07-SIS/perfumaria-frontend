import { beforeEach, describe, expect, it, vi } from "vitest";

const { sessionClearMock, sessionRestoreMock, sessionSaveMock } = vi.hoisted(() => ({
  sessionClearMock: vi.fn(),
  sessionRestoreMock: vi.fn(),
  sessionSaveMock: vi.fn(),
}));

vi.mock("../auth/session.service", () => ({
  sessionService: {
    clear: sessionClearMock,
    restore: sessionRestoreMock,
    save: sessionSaveMock,
  },
}));

import { authService } from "./auth.service";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionSaveMock.mockImplementation((session) => ({
      ...session,
      expiresAt: "2026-01-01T00:00:00.000Z",
    }));
  });

  it("creates a sanitized session for valid credentials", () => {
    const result = authService.login({
      credentials: {
        email: "admin@canalperfumado.com.br",
        password: "admin123",
      },
      users: [
        {
          cargo: "Administrador",
          email: "admin@canalperfumado.com.br",
          id: 1,
          nome: "Admin",
          senha: "admin123",
        },
      ],
    });

    expect(sessionSaveMock).toHaveBeenCalledWith({
      accessToken: expect.stringMatching(/^peract-token-1-/),
      user: {
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: 1,
        nome: "Admin",
      },
    });
    expect(result).toMatchObject({
      user: {
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: 1,
        nome: "Admin",
      },
    });
  });

  it("returns null for invalid credentials", () => {
    const result = authService.login({
      credentials: {
        email: "admin@canalperfumado.com.br",
        password: "errada",
      },
      users: [
        {
          cargo: "Administrador",
          email: "admin@canalperfumado.com.br",
          id: 1,
          nome: "Admin",
          senha: "admin123",
        },
      ],
    });

    expect(result).toBeNull();
    expect(sessionSaveMock).not.toHaveBeenCalled();
  });

  it("delegates logout and restoreSession to sessionService", () => {
    sessionRestoreMock.mockReturnValue({ accessToken: "token", expiresAt: "2026-01-01T00:00:00.000Z", user: { cargo: "Funcionário", email: "a@a.com", id: 1, nome: "A" } });

    authService.logout();
    const restored = authService.restoreSession();

    expect(sessionClearMock).toHaveBeenCalled();
    expect(restored).toEqual({ accessToken: "token", expiresAt: "2026-01-01T00:00:00.000Z", user: { cargo: "Funcionário", email: "a@a.com", id: 1, nome: "A" } });
  });
});