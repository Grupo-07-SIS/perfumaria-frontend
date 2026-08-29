import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticateMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
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
  });

  it("waits and authenticates with trimmed email", async () => {
    vi.useFakeTimers();
    const authPromise = executeLogin({
      credentials: {
        email: "  admin@canalperfumado.com.br  ",
        password: "admin123",
      },
      users: [],
    });

    await vi.advanceTimersByTimeAsync(700);
    await authPromise;

    expect(authenticateMock).toHaveBeenCalledWith({
      credentials: {
        email: "admin@canalperfumado.com.br",
        password: "admin123",
      },
      users: [],
    });

    vi.useRealTimers();
  });

  it("reports whether an authenticated session exists", () => {
    expect(hasAuthenticatedSession(null)).toBe(false);
    expect(
      hasAuthenticatedSession({
        accessToken: "token-123",
        expiresAt: "2026-01-01T00:00:00.000Z",
        user: { cargo: "Administrador", email: "admin@canalperfumado.com.br", id: 1, nome: "Admin" },
      }),
    ).toBe(true);
  });
});