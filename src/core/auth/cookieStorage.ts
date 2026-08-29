interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  sameSite?: "Lax" | "None" | "Strict";
  secure?: boolean;
}

function canUseDocument() {
  return typeof document !== "undefined";
}

function buildCookieOptions(options: CookieOptions) {
  const parts = [
    `path=${options.path ?? "/"}`,
    `SameSite=${options.sameSite ?? "Lax"}`,
  ];

  if (options.maxAge !== undefined) parts.push(`max-age=${options.maxAge}`);
  if (options.expires) parts.push(`expires=${options.expires.toUTCString()}`);
  if (options.secure ?? import.meta.env.PROD) parts.push("Secure");

  return parts.join("; ");
}

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  if (!canUseDocument()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${buildCookieOptions(options)}`;
}

export function getCookie(name: string) {
  if (!canUseDocument()) return null;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) return null;
  return decodeURIComponent(cookie.slice(name.length + 1));
}

export function removeCookie(name: string, options: CookieOptions = {}) {
  setCookie(name, "", {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  });
}