import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("writes info, warn and error logs with the Peract prefix", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.info("Sessão iniciada", { id: 1 });
    logger.warn("Estoque crítico");
    logger.error("Falha de integração", { status: 500 });

    expect(infoSpy).toHaveBeenCalledWith("[Peract:info] Sessão iniciada", { id: 1 });
    expect(warnSpy).toHaveBeenCalledWith("[Peract:warn] Estoque crítico");
    expect(errorSpy).toHaveBeenCalledWith("[Peract:error] Falha de integração", { status: 500 });
  });

  it("logs debug only when the environment allows it", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    logger.debug("Debug de autenticação");

    if (import.meta.env.DEV) {
      expect(debugSpy).toHaveBeenCalledWith("[Peract:debug] Debug de autenticação");
      return;
    }

    expect(debugSpy).not.toHaveBeenCalled();
  });
});