import { describe, expect, it, vi, beforeEach } from "vitest";

const { getCookieMock, removeCookieMock, setCookieMock } = vi.hoisted(() => ({
  getCookieMock: vi.fn(),
  removeCookieMock: vi.fn(),
  setCookieMock: vi.fn(),
}));

vi.mock("./cookieStorage", () => ({
  getCookie: getCookieMock,
  removeCookie: removeCookieMock,
  setCookie: setCookieMock,
}));

import { tokenService } from "./token.service";

describe("tokenService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the auth token from cookie storage", () => {
    getCookieMock.mockReturnValue("token-123");

    expect(tokenService.get()).toBe("token-123");
    expect(getCookieMock).toHaveBeenCalledWith("authSessionToken");
  });

  it("persists the auth token with max age", () => {
    tokenService.set("token-123", 1200);

    expect(setCookieMock).toHaveBeenCalledWith("authSessionToken", "token-123", { maxAge: 1200 });
  });

  it("clears the auth token cookie", () => {
    tokenService.clear();

    expect(removeCookieMock).toHaveBeenCalledWith("authSessionToken");
  });
});