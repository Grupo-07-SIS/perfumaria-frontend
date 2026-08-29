import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);

import { categoriesRepository } from "./categories.repository";

describe("categoriesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists categories from the backend", async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue([{ id: 1, nome: "Perfumes", qtdProdVinculados: 3 }]),
      ok: true,
    });

    const result = await categoriesRepository.listCategories();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/categorias", {
      credentials: "include",
      method: "GET",
    });
    expect(result).toEqual([{ id: 1, nome: "Perfumes", qtdProdVinculados: 3 }]);
  });

  it("creates a category using the categories endpoint", async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ id: 2, nome: "Body Splash", qtdProdVinculados: 0 }),
      ok: true,
    });

    const result = await categoriesRepository.createCategory({ nome: "Body Splash" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/categorias", {
      body: JSON.stringify({ nome: "Body Splash" }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    expect(result).toEqual({ id: 2, nome: "Body Splash", qtdProdVinculados: 0 });
  });

  it("updates and deletes categories using the id path", async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ id: 3, nome: "Kits", qtdProdVinculados: 1 }),
        ok: true,
      })
      .mockResolvedValueOnce({ ok: true });

    const updated = await categoriesRepository.updateCategory(3, { nome: "Kits" });
    await categoriesRepository.deleteCategory(3);

    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:8080/categorias/3", {
      body: JSON.stringify({ nome: "Kits" }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://localhost:8080/categorias/3", {
      credentials: "include",
      method: "DELETE",
    });
    expect(updated).toEqual({ id: 3, nome: "Kits", qtdProdVinculados: 1 });
  });

  it("throws when listing categories fails", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    await expect(categoriesRepository.listCategories()).rejects.toThrow("CATEGORIES_LIST_FAILED:401");
  });
});