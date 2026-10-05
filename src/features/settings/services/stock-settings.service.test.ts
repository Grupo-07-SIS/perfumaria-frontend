import { beforeEach, describe, expect, it, vi } from "vitest";
import { settingsRepository } from "../repository/settings.repository";
import { fetchStockLimit, hasOrganization, isValidStockLimit, saveStockLimit, stockSettingsError } from "./stock-settings.service";

vi.mock("../repository/settings.repository", () => ({ settingsRepository: { getOrganization: vi.fn(), updateLimit: vi.fn() } }));

describe("stock settings service", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([null, 1, 10, 2147483647])("loads the documented limit %s", async (limite) => {
    vi.mocked(settingsRepository.getOrganization).mockResolvedValue({ idOrganizacao: 7, nome: "Loja", limite });
    expect(await fetchStockLimit(7)).toBe(limite);
  });

  it.each([0, -1, 1.5, NaN, Infinity, 2147483648])("rejects invalid limit %s before sending", async (limit) => {
    expect(isValidStockLimit(limit)).toBe(false);
    await expect(saveStockLimit(7, String(limit))).rejects.toThrow("INVALID_STOCK_SETTINGS");
    expect(settingsRepository.updateLimit).not.toHaveBeenCalled();
  });

  it.each([undefined, null, 0, -1, 1.5, NaN, Infinity])("rejects missing or invalid organization %s", (id) => {
    expect(hasOrganization(id)).toBe(false);
  });

  it("does not send a request without a valid organization", async () => {
    await expect(saveStockLimit(0, "10")).rejects.toThrow("INVALID_STOCK_SETTINGS");
    expect(settingsRepository.updateLimit).not.toHaveBeenCalled();
  });

  it("returns the saved limit, not an optimistic value", async () => {
    vi.mocked(settingsRepository.updateLimit).mockResolvedValue({ idOrganizacao: 7, nome: "Loja", limite: 12 });
    expect(await saveStockLimit(7, "10")).toBe(12);
    expect(settingsRepository.updateLimit).toHaveBeenCalledWith(7, { limite: 10 });
  });

  it.each([
    { idOrganizacao: 8, nome: "Outra loja", limite: 10 },
    { idOrganizacao: 7, nome: "Loja", limite: -1 },
  ])("rejects mismatched or invalid organization responses", async (response) => {
    vi.mocked(settingsRepository.getOrganization).mockResolvedValue(response);
    vi.mocked(settingsRepository.updateLimit).mockResolvedValue(response);
    await expect(fetchStockLimit(7)).rejects.toThrow("INVALID_ORGANIZATION_RESPONSE");
    await expect(saveStockLimit(7, "10")).rejects.toThrow("INVALID_ORGANIZATION_RESPONSE");
  });

  it("does not confirm saving when the response has no limit", async () => {
    vi.mocked(settingsRepository.updateLimit).mockResolvedValue({ idOrganizacao: 7, nome: "Loja", limite: null });
    await expect(saveStockLimit(7, "10")).rejects.toThrow("INVALID_ORGANIZATION_RESPONSE");
  });

  it.each([
    [400, "Limite inválido. Verifique o valor informado."],
    [401, "Sessão expirada. Entre novamente."],
    [403, "Você não tem permissão para alterar esta organização."],
    [404, "Organização não encontrada."],
    [500, "Falha ao salvar."],
  ])("translates HTTP %s", (status, message) => {
    expect(stockSettingsError({ isAxiosError: true, response: { status } }, "Falha ao salvar.")).toBe(message);
  });

  it("handles network and unexpected errors", () => {
    expect(stockSettingsError({ isAxiosError: true }, "Falha de rede.")).toBe("Falha de rede.");
    expect(stockSettingsError(new Error("offline"), "Falha de rede.")).toBe("Falha de rede.");
  });
});