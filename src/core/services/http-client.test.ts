import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { tokenGetMock } = vi.hoisted(() => ({
  tokenGetMock: vi.fn(),
}));

vi.mock("../auth/token.service", () => ({
  tokenService: {
    get: tokenGetMock,
  },
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
});