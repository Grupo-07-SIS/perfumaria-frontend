import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../core/services/http-client";
import { salesRepository } from "./sales.repository";

vi.mock("../../../core/services/http-client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));

describe("salesRepository", () => {
  beforeEach(() => vi.resetAllMocks());

  it("loads every product page with status and stock from the complete catalog", async () => {
    const firstProduct = { id: 42, nome: "Perfume", precoVenda: 90, estoqueAtual: 8, status: 1 };
    const secondProduct = { ...firstProduct, id: 43, nome: "Outro perfume" };
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { content: [firstProduct], totalPages: 2 } })
      .mockResolvedValueOnce({ data: { content: [secondProduct], totalPages: 2 } });
    expect(await salesRepository.listProducts()).toEqual([firstProduct, secondProduct]);
    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/produtos", { params: { page: 0, size: 100, ordenacao: "nome,asc" } });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/produtos", { params: { page: 1, size: 100, ordenacao: "nome,asc" } });
  });

  it("returns an empty catalog when the first page is empty", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [], totalPages: 0 } });
    expect(await salesRepository.listProducts()).toEqual([]);
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it("does not return an incomplete catalog if a later page fails", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { content: [{ id: 42 }], totalPages: 2 } })
      .mockRejectedValueOnce(new Error("offline"));
    await expect(salesRepository.listProducts()).rejects.toThrow("offline");
  });

  it("loads every page of active customers", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { content: [{ id: 8 }], totalPages: 2 } })
      .mockResolvedValueOnce({ data: { content: [{ id: 9 }], totalPages: 2 } });
    expect(await salesRepository.listCustomers()).toEqual([{ id: 8 }, { id: 9 }]);
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/clientes", { params: { page: 1, size: 100, status: 1 } });
  });

  it("posts a sale and accepts HTTP 201 without a response body", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ status: 201, data: "" });
    const payload = { clienteId: 8, forma: "Pix", tipoVenda: "PRESENCIAL" as const, desconto: 10, tipoDesconto: "PERCENTUAL" as const, itens: [{ produtoId: 42, quantidade: 2 }] };
    await expect(salesRepository.createSale(payload)).resolves.toBeUndefined();
    expect(apiClient.post).toHaveBeenCalledWith("/vendas", payload);
  });

  it("creates customers with real backend IDs", async () => {
    const payload = { nome: "Ana", telefone: "11999998888", email: "ana@example.test" };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 81, ...payload } });
    expect(await salesRepository.createCustomer(payload)).toEqual({ id: 81, ...payload });
    expect(apiClient.post).toHaveBeenCalledWith("/clientes", payload);
  });

  it("propagates failures instead of simulating success", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("offline"));
    vi.mocked(apiClient.post).mockRejectedValue(new Error("offline"));
    await expect(salesRepository.listProducts()).rejects.toThrow("offline");
    await expect(salesRepository.listCustomers()).rejects.toThrow("offline");
    await expect(salesRepository.createSale({ clienteId: 8, forma: "Pix", tipoVenda: "PRESENCIAL", desconto: 0, tipoDesconto: "VALOR", itens: [] })).rejects.toThrow("offline");
    await expect(salesRepository.createCustomer({ nome: "Ana", telefone: "11999998888", email: "ana@example.test" })).rejects.toThrow("offline");
  });
});