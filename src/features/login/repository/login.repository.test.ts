import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientPostMock } = vi.hoisted(() => ({
  apiClientPostMock: vi.fn(),
}));

vi.mock("../../../core/services/http-client", () => ({
  apiClient: {
    post: apiClientPostMock,
  },
}));

import { loginRepository } from "./login.repository";

function axiosError(status: number) {
  return {
    isAxiosError: true,
    response: { status },
  };
}

describe("loginRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts login credentials to the backend auth route", async () => {
    apiClientPostMock.mockResolvedValue({ data: { accessToken: "token-123" } });

    const result = await loginRepository.authenticate({
      credentials: {
        email: "admin@canalperfumado.com.br",
        senha: "admin123",
      },
    });

    expect(apiClientPostMock).toHaveBeenCalledWith("/auth/login", {
      email: "admin@canalperfumado.com.br",
      senha: "admin123",
    });
    expect(result).toEqual({ accessToken: "token-123" });
  });

  it("preserves the login error code and Axios response status", async () => {
    apiClientPostMock.mockRejectedValue(axiosError(401));

    await expect(
      loginRepository.authenticate({
        credentials: {
          email: "admin@canalperfumado.com.br",
          senha: "errada",
        },
      }),
    ).rejects.toThrow("LOGIN_REQUEST_FAILED:401");
    expect(apiClientPostMock).toHaveBeenCalledWith("/auth/login", {
      email: "admin@canalperfumado.com.br",
      senha: "errada",
    });
  });
});