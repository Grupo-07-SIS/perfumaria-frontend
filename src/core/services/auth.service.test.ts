import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock, sessionClearMock, sessionRestoreMock, sessionSaveMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  sessionClearMock: vi.fn(),
  sessionRestoreMock: vi.fn(),
  sessionSaveMock: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);

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

  it("persists a received authenticated session", () => {
    const result = authService.saveSession({
      accessToken: "token-123",
      expiresIn: 3600,
      user: {
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: "uuid-1",
        nome: "Admin",
      },
    });

    expect(sessionSaveMock).toHaveBeenCalledWith({
      accessToken: "token-123",
      user: {
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: "uuid-1",
        nome: "Admin",
      },
    }, 3600);
    expect(result).toMatchObject({
      user: {
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: "uuid-1",
        nome: "Admin",
      },
    });
  });

  it("clears the locally persisted session", () => {
    authService.clearSession();

    expect(sessionClearMock).toHaveBeenCalled();
  });

  it("delegates logout to backend and always clears the local session", async () => {
    fetchMock.mockResolvedValue({ ok: true });

    await authService.logout();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/auth/logout", {
      credentials: "include",
      method: "POST",
    });
    expect(sessionClearMock).toHaveBeenCalled();
  });

  it("restores the saved session from sessionService", () => {
    sessionRestoreMock.mockReturnValue({ accessToken: "token", expiresAt: "2026-01-01T00:00:00.000Z", user: { cargo: "Funcionário", email: "a@a.com", id: "uuid-2", nome: "A" } });

    const restored = authService.restoreSession();

    expect(restored).toEqual({ accessToken: "token", expiresAt: "2026-01-01T00:00:00.000Z", user: { cargo: "Funcionário", email: "a@a.com", id: "uuid-2", nome: "A" } });
  });
});