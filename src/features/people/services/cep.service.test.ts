import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCepAddress } from "./cep.service";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

describe("CEP lookup", () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset();
  });

  it("queries the public API without credentials and maps only address fields", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: {
      logradouro: " Rua dos Testes ", bairro: " Centro ", localidade: " Sao Paulo ", uf: "SP", complemento: "lado impar",
    } });
    const controller = new AbortController();
    await expect(fetchCepAddress("01001-000", controller.signal)).resolves.toEqual({
      logradouro: "Rua dos Testes", bairro: "Centro", cidade: "Sao Paulo", uf: "SP",
    });
    expect(axios.get).toHaveBeenCalledWith("https://viacep.com.br/ws/01001000/json/", {
      signal: controller.signal, timeout: 5000, withCredentials: false,
    });
  });

  it.each(["", "01001", "010010000"])("does not query incomplete or invalid CEP %s", async cep => {
    await expect(fetchCepAddress(cep)).rejects.toThrow("CEP_INVALID");
    expect(axios.get).not.toHaveBeenCalled();
  });

  it.each([true, "true"])("recognizes the not-found response %s", async erro => {
    vi.mocked(axios.get).mockResolvedValue({ data: { erro } });
    await expect(fetchCepAddress("01001000")).rejects.toThrow("CEP_NOT_FOUND");
  });

  it("accepts a city-wide CEP without street or neighborhood", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { localidade: "Cidade", uf: "MG" } });
    await expect(fetchCepAddress("01001000")).resolves.toEqual({ logradouro: "", bairro: "", cidade: "Cidade", uf: "MG" });
  });

  it("rejects unexpected responses rather than filling invalid address data", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { uf: "XX" } });
    await expect(fetchCepAddress("01001000")).rejects.toThrow("CEP_INVALID_RESPONSE");
  });

  it("propagates service failures to the form", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("Network Error"));
    await expect(fetchCepAddress("01001000")).rejects.toThrow("Network Error");
  });
});