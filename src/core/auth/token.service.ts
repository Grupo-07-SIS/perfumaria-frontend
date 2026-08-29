import { getCookie, removeCookie, setCookie } from "./cookieStorage";

const AUTH_TOKEN_COOKIE = "authSessionToken";

export const tokenService = {
  clear() {
    removeCookie(AUTH_TOKEN_COOKIE);
  },
  get() {
    return getCookie(AUTH_TOKEN_COOKIE);
  },
  set(token: string, expiresInSeconds: number) {
    setCookie(AUTH_TOKEN_COOKIE, token, { maxAge: expiresInSeconds });
  },
};