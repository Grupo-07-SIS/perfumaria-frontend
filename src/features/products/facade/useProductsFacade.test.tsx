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

describe("useProductsFacade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads products, derives stock status and filters them", async () => {
    fetchProductsMock.mockResolvedValue([
      { ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 9, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 },
      { ativo: 1, categoriaId: 2, categoriaNome: "Body Splash", estoqueAtual: 0, id: 2, marca: "Peract", nome: "Fresh", precoVenda: 40 },
    ]);
    fetchProductCategoriesMock.mockResolvedValue([{ id: 1, nome: "Perfumes" }, { id: 2, nome: "Body Splash" }]);

    const { result } = renderHook(() => useProductsFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchProductsMock).toHaveBeenCalledWith({ nome: "", ordenacao: "nome,asc" });

    expect(result.current.products[0].estoqueStatus).toBe("ok");
    expect(result.current.products[1].estoqueStatus).toBe("esgotado");

    act(() => {
      result.current.setSearch("chance");
      result.current.setSelectedCategory("1");
      result.current.setStatusFilter("ok");
    });

    expect(fetchProductsMock).toHaveBeenCalledTimes(1);
    expect(result.current.filteredProductsCount).toBe(1);
    expect(result.current.paginatedProducts[0].nome).toBe("Chance");
  });

  it("fetches products remotely when pressing search or changing ordering", async () => {
    fetchProductsMock
      .mockResolvedValueOnce([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 9, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 }])
      .mockResolvedValueOnce([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 4, id: 2, marca: "Dior", nome: "Dior Homme", precoVenda: 210 }])
      .mockResolvedValueOnce([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 4, id: 2, marca: "Dior", nome: "Dior Homme", precoVenda: 210 }]);
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

    expect(fetchProductsMock).toHaveBeenNthCalledWith(2, { nome: "dior", ordenacao: "nome,asc" });
    expect(result.current.products[0].nome).toBe("Dior Homme");

    await act(async () => {
      await result.current.toggleSort("marca");
    });

    expect(fetchProductsMock).toHaveBeenNthCalledWith(3, { nome: "dior", ordenacao: "marca,asc" });
  });

  it("creates, updates and deletes products through the facade", async () => {
    fetchProductsMock.mockResolvedValue([{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 9, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 }]);
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
});