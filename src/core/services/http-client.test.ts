import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { tokenGetMock, sessionClearMock } = vi.hoisted(() => ({
  tokenGetMock: vi.fn(),
  sessionClearMock: vi.fn(),
}));

vi.mock("../auth/token.service", () => ({
  tokenService: {
    get: tokenGetMock,
  },
}));

vi.mock("../auth/session.service", () => ({
  sessionService: { clear: sessionClearMock },
}));

import { apiClient } from "./http-client";

function createCapturingAdapter(onRequest: (config: InternalAxiosRequestConfig) => void): AxiosAdapter {
  return async (config) => {
    onRequest(config);

    return {
      config,
      data: { ok: true },
      headers: {},
      status: 200,
      statusText: "OK",
    };
  };
}

function createErrorAdapter(status: number, onRequest?: () => void): AxiosAdapter {
  return async config => {
    onRequest?.();
    throw new AxiosError("Request failed", AxiosError.ERR_BAD_REQUEST, config, undefined, {
      config, data: {}, headers: {}, status, statusText: "Request failed",
    });
  };
}

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the backend base URL and sends credentials", async () => {
    let capturedConfig: InternalAxiosRequestConfig | undefined;

    await apiClient.get("/health", {
      adapter: createCapturingAdapter((config) => {
        capturedConfig = config;
      }),
    });

    expect(capturedConfig).toMatchObject({
      baseURL: "http://localhost:8080",
      method: "get",
      url: "/health",
      withCredentials: true,
    });
  });

  it("adds the current bearer token through a request interceptor", async () => {
    tokenGetMock.mockReturnValue("token-123");
    let capturedConfig: InternalAxiosRequestConfig | undefined;

    await apiClient.get("/protegido", {
      adapter: createCapturingAdapter((config) => {
        capturedConfig = config;
      }),
    });

    expect(tokenGetMock).toHaveBeenCalledOnce();
    expect(capturedConfig?.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("does not send an authorization header when there is no token", async () => {
    tokenGetMock.mockReturnValue(undefined);
    let capturedConfig: InternalAxiosRequestConfig | undefined;

    await apiClient.get("/publico", {
      adapter: createCapturingAdapter((config) => {
        capturedConfig = config;
      }),
    });

    expect(capturedConfig?.headers.has("Authorization")).toBe(false);
  });

  it("clears the active session on a protected endpoint 401 and preserves the error", async () => {
    tokenGetMock.mockReturnValue("token-123");
    await expect(apiClient.get("/vendas", { adapter: createErrorAdapter(401) })).rejects.toMatchObject({ response: { status: 401 } });
    expect(sessionClearMock).toHaveBeenCalledOnce();
  });

  it("clears stale UI authentication when the token cookie has expired", async () => {
    tokenGetMock.mockReturnValue(null);
    await expect(apiClient.get("/produtos", { adapter: createErrorAdapter(401) })).rejects.toBeInstanceOf(AxiosError);
    expect(sessionClearMock).toHaveBeenCalledOnce();
  });

  it.each(["/auth/login", "/auth/alterar-senha", "/auth/alterar-email"])("does not log out on credential rejection at %s", async path => {
    tokenGetMock.mockReturnValue("token-123");
    await expect(apiClient.patch(path, {}, { adapter: createErrorAdapter(401) })).rejects.toBeInstanceOf(AxiosError);
    expect(sessionClearMock).not.toHaveBeenCalled();
  });

  it.each([403, 400, 500])("does not clear the session on HTTP %s", async status => {
    tokenGetMock.mockReturnValue("token-123");
    await expect(apiClient.get("/vendas", { adapter: createErrorAdapter(status) })).rejects.toBeInstanceOf(AxiosError);
    expect(sessionClearMock).not.toHaveBeenCalled();
  });

  it("ignores a delayed 401 from a previous session", async () => {
    tokenGetMock.mockReturnValue("old-token");
    await expect(apiClient.get("/vendas", {
      adapter: createErrorAdapter(401, () => tokenGetMock.mockReturnValue("new-token")),
    })).rejects.toBeInstanceOf(AxiosError);
    expect(sessionClearMock).not.toHaveBeenCalled();
  });
});