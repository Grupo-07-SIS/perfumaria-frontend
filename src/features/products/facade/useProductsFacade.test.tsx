import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createProductMock,
  fetchProductCategoriesMock,
  fetchProductsMock,
  removeProductMock,
  updateProductMock,
} = vi.hoisted(() => ({
  createProductMock: vi.fn(),
  fetchProductCategoriesMock: vi.fn(),
  fetchProductsMock: vi.fn(),
  removeProductMock: vi.fn(),
  updateProductMock: vi.fn(),
}));

vi.mock("../../../app/context/AppContext", () => ({
  useApp: () => ({ stockThresholds: { critico: 6 } }),
}));

vi.mock("../services/products.service", () => ({
  createProduct: createProductMock,
  fetchProductCategories: fetchProductCategoriesMock,
  fetchProducts: fetchProductsMock,
  removeProduct: removeProductMock,
  updateProduct: updateProductMock,
}));

import { useProductsFacade } from "./useProductsFacade";
import type { Product } from "../models/products.models";

function productPage(content: Product[], number = 0, totalElements = content.length) {
  return { content, number, totalElements, totalPages: Math.ceil(totalElements / 10) };
}

describe("useProductsFacade", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads products, derives stock status and filters them", async () => {
    fetchProductsMock.mockResolvedValue(productPage([
      { ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 9, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 },
      { ativo: 1, categoriaId: 2, categoriaNome: "Body Splash", estoqueAtual: 0, id: 2, marca: "Peract", nome: "Fresh", precoVenda: 40 },
    ]));
    fetchProductCategoriesMock.mockResolvedValue([{ id: 1, nome: "Perfumes" }, { id: 2, nome: "Body Splash" }]);

    const { result } = renderHook(() => useProductsFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchProductsMock).toHaveBeenCalledWith(expect.objectContaining({ nome: "", ordenacao: "nome,asc", page: 0 }));

    expect(result.current.products[0].estoqueStatus).toBe("ok");
    expect(result.current.products[1].estoqueStatus).toBe("esgotado");

    fetchProductsMock.mockResolvedValue(productPage([result.current.products[0]]));
    await act(async () => {
      result.current.setSearch("chance");
      result.current.setSelectedCategory("1");
      result.current.setStatusFilter("ok");
    });

    expect(fetchProductsMock).toHaveBeenLastCalledWith(expect.objectContaining({ categoriaId: 1, estoqueMin: 7, page: 0 }));
    expect(result.current.filteredProductsCount).toBe(1);
    expect(result.current.paginatedProducts[0].nome).toBe("Chance");
  });

  it("fetches products remotely when pressing search or changing ordering", async () => {
    fetchProductsMock
      .mockResolvedValueOnce(productPage([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 9, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 }]))
      .mockResolvedValueOnce(productPage([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 4, id: 2, marca: "Dior", nome: "Dior Homme", precoVenda: 210 }]))
      .mockResolvedValueOnce(productPage([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 4, id: 2, marca: "Dior", nome: "Dior Homme", precoVenda: 210 }]));
    fetchProductCategoriesMock.mockResolvedValue([{ id: 1, nome: "Perfumes" }]);

    const { result } = renderHook(() => useProductsFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSearch("dior");
    });

    expect(fetchProductsMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.submitSearch();
    });

    expect(fetchProductsMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ nome: "dior", ordenacao: "nome,asc", page: 0 }));
    expect(result.current.products[0].nome).toBe("Dior Homme");

    await act(async () => {
      await result.current.toggleSort("marca");
    });

    expect(fetchProductsMock).toHaveBeenNthCalledWith(3, expect.objectContaining({ nome: "dior", ordenacao: "marca,asc", page: 0 }));
  });

  it("creates, updates and deletes products through the facade", async () => {
    fetchProductsMock.mockResolvedValue(productPage([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 9, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 }]));
    fetchProductCategoriesMock.mockResolvedValue([{ id: 1, nome: "Perfumes" }]);
    createProductMock.mockResolvedValue({ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 7, id: 2, marca: "Dior", nome: "Sauvage", precoVenda: 150 });
    updateProductMock.mockResolvedValue({ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 5, id: 2, marca: "Dior", nome: "Sauvage Elixir", precoVenda: 180 });
    removeProductMock.mockResolvedValue(2);

    const { result } = renderHook(() => useProductsFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.openCreateForm();
    });

    await act(async () => {
      await result.current.submitProduct({ categoriaId: "1", estoqueAtual: "7", hasVolume: false, marca: "Dior", medida: "ML", nome: "Sauvage", precoCompra: "", precoVenda: "150", volume: "" });
    });

    act(() => {
      result.current.openEditForm({ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 7, id: 2, marca: "Dior", nome: "Sauvage", precoVenda: 150 });
    });

    await act(async () => {
      await result.current.submitProduct({ categoriaId: "1", estoqueAtual: "5", hasVolume: false, marca: "Dior", medida: "ML", nome: "Sauvage Elixir", precoCompra: "", precoVenda: "180", volume: "" });
    });

    act(() => {
      result.current.openDeleteConfirm({ id: 2, nome: "Sauvage Elixir" });
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.products).toHaveLength(1);
    expect(createProductMock).toHaveBeenCalled();
    expect(updateProductMock).toHaveBeenCalled();
    expect(removeProductMock).toHaveBeenCalledWith({ id: 2, nome: "Sauvage Elixir" });
    expect(fetchProductsMock).toHaveBeenCalledTimes(4);
  });

  it("loads 23 products across pages of 10, 10 and 3 and resets sorting to page one", async () => {
    const products = Array.from({ length: 23 }, (_, index) => ({
      ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: index,
      id: index + 1, marca: "Peract", nome: `Produto ${index + 1}`, precoVenda: 100,
    }));
    fetchProductsMock.mockImplementation(async ({ page = 0 }) => productPage(products.slice(page * 10, page * 10 + 10), page, 23));
    fetchProductCategoriesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useProductsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filteredProductsCount).toBe(23);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedProducts).toHaveLength(10);
    await act(async () => { result.current.setCurrentPage(2); });
    expect(result.current.paginatedProducts[0].id).toBe(11);
    await act(async () => { result.current.setCurrentPage(3); });
    expect(result.current.paginatedProducts).toHaveLength(3);
    expect(result.current.paginatedProducts[0].id).toBe(21);
    await act(async () => { result.current.toggleSort("margem"); });
    expect(result.current.currentPage).toBe(1);
    expect(fetchProductsMock).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0, ordenacao: "margem,asc" }));
    await act(async () => { result.current.toggleSort("margem"); });
    expect(fetchProductsMock).toHaveBeenLastCalledWith(expect.objectContaining({ ordenacao: "margem,desc" }));
  });

  it("returns to the previous page when the last product is deleted", async () => {
    const product = { ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 2, id: 11, marca: "", nome: "Teste", precoVenda: 10 };
    fetchProductsMock.mockResolvedValue(productPage([product], 0, 11));
    fetchProductCategoriesMock.mockResolvedValue([]);
    removeProductMock.mockResolvedValue(11);
    const { result } = renderHook(() => useProductsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    fetchProductsMock.mockResolvedValueOnce(productPage([product], 1, 11));
    await act(async () => { result.current.setCurrentPage(2); });
    act(() => result.current.openDeleteConfirm({ id: 11, nome: "Teste" }));
    fetchProductsMock.mockResolvedValueOnce(productPage([], 1, 10)).mockResolvedValueOnce(productPage([product], 0, 10));
    await act(async () => { await result.current.confirmDelete(); });
    await waitFor(() => expect(result.current.currentPage).toBe(1));
    expect(result.current.filteredProductsCount).toBe(10);
    expect(result.current.deleteTarget).toBeNull();
  });

  it("surfaces loading and submit errors", async () => {
    fetchProductsMock.mockRejectedValue(new Error("offline"));
    fetchProductCategoriesMock.mockResolvedValue([]);
    createProductMock.mockRejectedValue(new Error("save failed"));

    const { result } = renderHook(() => useProductsFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Não foi possível carregar os produtos.");

    act(() => {
      result.current.openCreateForm();
    });

    await act(async () => {
      await expect(result.current.submitProduct({ categoriaId: "1", estoqueAtual: "2", hasVolume: false, marca: "Dior", medida: "ML", nome: "Sauvage", precoCompra: "", precoVenda: "150", volume: "" })).rejects.toThrow("PRODUCTS_SUBMIT_FAILED");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Não foi possível salvar o produto.");
    });
  });

  it("ignores stale responses after changing filters and keeps empty results on page one", async () => {
    fetchProductsMock.mockResolvedValue(productPage([], 0, 23));
    fetchProductCategoriesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useProductsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let resolveOldPage!: (value: ReturnType<typeof productPage>) => void;
    fetchProductsMock.mockImplementationOnce(() => new Promise((resolve) => { resolveOldPage = resolve; }));
    await act(async () => { result.current.setCurrentPage(2); });
    fetchProductsMock.mockResolvedValueOnce(productPage([]));
    await act(async () => { result.current.setStatusFilter("esgotado"); });
    expect(fetchProductsMock).toHaveBeenLastCalledWith(expect.objectContaining({ estoqueMax: 0, page: 0 }));
    await act(async () => { resolveOldPage(productPage([], 1, 23)); });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.filteredProductsCount).toBe(0);
  });
});