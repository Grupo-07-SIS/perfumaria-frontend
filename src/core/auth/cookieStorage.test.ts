import { beforeEach, describe, expect, it } from "vitest";
import { getCookie, removeCookie, setCookie } from "./cookieStorage";

function clearCookies() {
  document.cookie
    .split("; ")
    .filter(Boolean)
    .forEach((cookieEntry) => {
      const cookieName = cookieEntry.split("=")[0];
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
}

describe("cookieStorage", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("stores and retrieves encoded cookie values", () => {
    setCookie("perfil", "João Silva", { maxAge: 60 });

    expect(getCookie("perfil")).toBe("João Silva");
  });

  it("returns null when the cookie does not exist", () => {
    expect(getCookie("inexistente")).toBeNull();
  });

  it("removes an existing cookie", () => {
    setCookie("authToken", "abc123", { maxAge: 60 });

    removeCookie("authToken");

    expect(getCookie("authToken")).toBeNull();
  });
});