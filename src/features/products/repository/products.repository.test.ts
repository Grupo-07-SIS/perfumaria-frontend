import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);

import { productsRepository } from "./products.repository";

describe("productsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists paged products from the backend", async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        content: [{ id: 1, nome: "Sauvage", categoriaNome: "Perfumes", fkCategoria: 2, estoqueAtual: 3, precoVenda: 100, status: 1 }],
        empty: false,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 1,
        size: 200,
        totalElements: 1,
        totalPages: 1,
      }),
      ok: true,
    });

    const result = await productsRepository.listProducts();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/produtos?page=0&size=200&ordenacao=nome,asc", {
      credentials: "include",
      method: "GET",
    });
    expect(result.content).toHaveLength(1);
  });

  it("lists categories and persists create or update requests", async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([{ id: 1, nome: "Perfumes" }]),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ id: 5, nome: "Sauvage", categoriaNome: "Perfumes", fkCategoria: 1, estoqueAtual: 8, precoVenda: 150, status: 1 }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ id: 5, nome: "Sauvage Elixir", categoriaNome: "Perfumes", fkCategoria: 1, estoqueAtual: 4, precoVenda: 180, status: 1 }),
        ok: true,
      });

    const categories = await productsRepository.listCategories();
    const created = await productsRepository.createProduct({ estoqueAtual: 8, fkCategoria: 1, nome: "Sauvage", precoVenda: 150 });
    const updated = await productsRepository.updateProduct(5, { estoqueAtual: 4, fkCategoria: 1, nome: "Sauvage Elixir", precoVenda: 180 });

    expect(categories).toEqual([{ id: 1, nome: "Perfumes" }]);
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://localhost:8080/produtos", {
      body: JSON.stringify({ estoqueAtual: 8, fkCategoria: 1, nome: "Sauvage", precoVenda: 150 }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, "http://localhost:8080/produtos/5", {
      body: JSON.stringify({ estoqueAtual: 4, fkCategoria: 1, nome: "Sauvage Elixir", precoVenda: 180 }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    expect(created.id).toBe(5);
    expect(updated.nome).toBe("Sauvage Elixir");
  });

  it("deletes products and throws on repository failures", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, status: 401 });

    await productsRepository.deleteProduct(9);
    await expect(productsRepository.listCategories()).rejects.toThrow("PRODUCTS_CATEGORIES_LIST_FAILED:401");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:8080/produtos/9", {
      credentials: "include",
      method: "DELETE",
    });
  });
});