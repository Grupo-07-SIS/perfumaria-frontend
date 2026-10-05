import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCookieMock,
  removeCookieMock,
  setCookieMock,
  tokenClearMock,
  tokenGetMock,
  tokenSetMock,
} = vi.hoisted(() => ({
  getCookieMock: vi.fn(),
  removeCookieMock: vi.fn(),
  setCookieMock: vi.fn(),
  tokenClearMock: vi.fn(),
  tokenGetMock: vi.fn(),
  tokenSetMock: vi.fn(),
}));

vi.mock("./cookieStorage", () => ({
  getCookie: getCookieMock,
  removeCookie: removeCookieMock,
  setCookie: setCookieMock,
}));

vi.mock("./token.service", () => ({
  tokenService: {
    clear: tokenClearMock,
    get: tokenGetMock,
    set: tokenSetMock,
  },
}));

import { sessionService } from "./session.service";

describe("sessionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves the session token and serialized user", () => {
    const result = sessionService.save(
      {
        accessToken: "token-123",
        user: {
          cargo: "Administrador",
          email: "admin@canalperfumado.com.br",
          id: 1,
          nome: "Admin",
        },
      },
      1800,
    );

    expect(tokenSetMock).toHaveBeenCalledWith("token-123", 1800);
    expect(setCookieMock).toHaveBeenCalledWith(
      "authUser",
      JSON.stringify({
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: 1,
        nome: "Admin",
      }),
      { maxAge: 1800 },
    );
    expect(Date.parse(result.expiresAt)).not.toBeNaN();
  });

  it("restores a valid session from cookies", () => {
    tokenGetMock.mockReturnValue("token-123");
    getCookieMock.mockReturnValue(JSON.stringify({
      cargo: "Funcionário",
      email: "beatriz@canalperfumado.com.br",
      id: 2,
      nome: "Beatriz",
    }));

    const result = sessionService.restore();

    expect(result).toMatchObject({
      accessToken: "token-123",
      user: {
        cargo: "Funcionário",
        email: "beatriz@canalperfumado.com.br",
        id: 2,
        nome: "Beatriz",
      },
    });
  });

  it("clears the session when token or user are invalid", () => {
    tokenGetMock.mockReturnValue(null);
    getCookieMock.mockReturnValue("{inválido");

    const result = sessionService.restore();

    expect(result).toBeNull();
    expect(tokenClearMock).toHaveBeenCalled();
    expect(removeCookieMock).toHaveBeenCalledWith("authUser");
  });

  it("clears persisted session data", () => {
    sessionService.clear();

    expect(tokenClearMock).toHaveBeenCalled();
    expect(removeCookieMock).toHaveBeenCalledWith("authUser");
  });

  it("preserves the organization when saving and restoring the authenticated user", () => {
    const user = {
      cargo: "Administrador" as const,
      email: "admin@example.test",
      id: "user-1",
      idOrganizacao: 7,
      nome: "Admin",
    };
    sessionService.save({ accessToken: "token-123", user });
    expect(setCookieMock).toHaveBeenCalledWith("authUser", JSON.stringify(user), expect.any(Object));
    tokenGetMock.mockReturnValue("token-123");
    getCookieMock.mockReturnValue(JSON.stringify(user));
    expect(sessionService.restore()?.user).toEqual(user);
  });
});