import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientPostMock, sessionClearMock, sessionRestoreMock, sessionSaveMock } = vi.hoisted(() => ({
  apiClientPostMock: vi.fn(),
  sessionClearMock: vi.fn(),
  sessionRestoreMock: vi.fn(),
  sessionSaveMock: vi.fn(),
}));

vi.mock("./http-client", () => ({
  apiClient: {
    post: apiClientPostMock,
  },
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
    apiClientPostMock.mockResolvedValue({ data: undefined });

    await authService.logout();

    expect(apiClientPostMock).toHaveBeenCalledWith("/auth/logout");
    expect(sessionClearMock).toHaveBeenCalled();
  });

  it("clears the local session when the logout request fails", async () => {
    apiClientPostMock.mockRejectedValue(new Error("Network Error"));

    await expect(authService.logout()).rejects.toThrow("Network Error");

    expect(apiClientPostMock).toHaveBeenCalledWith("/auth/logout");
    expect(sessionClearMock).toHaveBeenCalledOnce();
  });

  it("restores the saved session from sessionService", () => {
    sessionRestoreMock.mockReturnValue({ accessToken: "token", expiresAt: "2026-01-01T00:00:00.000Z", user: { cargo: "Funcionário", email: "a@a.com", id: "uuid-2", nome: "A" } });

    const restored = authService.restoreSession();

    expect(restored).toEqual({ accessToken: "token", expiresAt: "2026-01-01T00:00:00.000Z", user: { cargo: "Funcionário", email: "a@a.com", id: "uuid-2", nome: "A" } });
  });
});