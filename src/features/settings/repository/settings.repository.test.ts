import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../core/services/http-client";
import { settingsRepository } from "./settings.repository";

vi.mock("../../../core/services/http-client", () => ({ apiClient: { get: vi.fn(), patch: vi.fn() } }));

describe("settingsRepository", () => {
  beforeEach(() => vi.resetAllMocks());

  it("loads the authenticated organization and patches only its limit", async () => {
    const organization = { idOrganizacao: 7, nome: "Loja", limite: 10 };
    vi.mocked(apiClient.get).mockResolvedValue({ data: organization });
    vi.mocked(apiClient.patch).mockResolvedValue({ data: organization });
    expect(await settingsRepository.getOrganization(7)).toEqual(organization);
    expect(apiClient.get).toHaveBeenCalledWith("/organizacoes/7");
    expect(await settingsRepository.updateLimit(7, { limite: 10 })).toEqual(organization);
    expect(apiClient.patch).toHaveBeenCalledWith("/organizacoes/7/limite", { limite: 10 });
  });

  it("propagates failures without returning a successful result", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("offline"));
    vi.mocked(apiClient.patch).mockRejectedValue(new Error("offline"));
    await expect(settingsRepository.getOrganization(7)).rejects.toThrow("offline");
    await expect(settingsRepository.updateLimit(7, { limite: 10 })).rejects.toThrow("offline");
  });
});