import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);

import { loginRepository } from "./login.repository";

describe("loginRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts login credentials to the backend auth route", async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ accessToken: "token-123" }),
      ok: true,
    });

    await loginRepository.authenticate({
      credentials: {
        email: "admin@canalperfumado.com.br",
        senha: "admin123",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/auth/login", {
      body: JSON.stringify({
        email: "admin@canalperfumado.com.br",
        senha: "admin123",
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  });

  it("throws when the backend rejects the login", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    await expect(
      loginRepository.authenticate({
        credentials: {
          email: "admin@canalperfumado.com.br",
          senha: "errada",
        },
      }),
    ).rejects.toThrow("LOGIN_REQUEST_FAILED:401");
  });
});