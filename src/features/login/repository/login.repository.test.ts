import { beforeEach, describe, expect, it, vi } from "vitest";

const { authLoginMock } = vi.hoisted(() => ({
  authLoginMock: vi.fn(),
}));

vi.mock("../../../core/services/auth.service", () => ({
  authService: {
    login: authLoginMock,
  },
}));

import { loginRepository } from "./login.repository";

describe("loginRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps users and forwards authentication to authService", () => {
    loginRepository.authenticate({
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

    expect(authLoginMock).toHaveBeenCalledWith({
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
  });
});