import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createCategoryMock,
  fetchCategoriesMock,
  removeCategoryMock,
  updateCategoryMock,
} = vi.hoisted(() => ({
  createCategoryMock: vi.fn(),
  fetchCategoriesMock: vi.fn(),
  removeCategoryMock: vi.fn(),
  updateCategoryMock: vi.fn(),
}));

vi.mock("../services/categories.service", () => ({
  createCategory: createCategoryMock,
  fetchCategories: fetchCategoriesMock,
  removeCategory: removeCategoryMock,
  updateCategory: updateCategoryMock,
}));

import { useCategoriesFacade } from "./useCategoriesFacade";

describe("useCategoriesFacade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads categories on mount and paginates them", async () => {
    fetchCategoriesMock.mockResolvedValue([
      { id: 2, linkedProducts: 0, nome: "Body Splash" },
      { id: 1, linkedProducts: 3, nome: "Perfumes" },
    ]);

    const { result } = renderHook(() => useCategoriesFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([
      { id: 2, linkedProducts: 0, nome: "Body Splash" },
      { id: 1, linkedProducts: 3, nome: "Perfumes" },
    ]);
    expect(result.current.paginatedCategories).toHaveLength(2);
    expect(result.current.error).toBe("");
  });

  it("creates, updates and deletes categories through the facade", async () => {
    fetchCategoriesMock.mockResolvedValue([{ id: 1, linkedProducts: 0, nome: "Perfumes" }]);
    createCategoryMock.mockResolvedValue({ id: 2, linkedProducts: 0, nome: "Body Splash" });
    updateCategoryMock.mockResolvedValue({ id: 2, linkedProducts: 4, nome: "Body Splash Premium" });
    removeCategoryMock.mockResolvedValue(2);

    const { result } = renderHook(() => useCategoriesFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.openCreateForm();
    });

    await act(async () => {
      await result.current.submitCategory({ nome: "Body Splash" });
    });

    act(() => {
      result.current.openEditForm({ id: 2, nome: "Body Splash" });
    });

    await act(async () => {
      await result.current.submitCategory({ nome: "Body Splash Premium" });
    });

    act(() => {
      result.current.openDeleteConfirm({ id: 2, linkedProducts: 4, nome: "Body Splash Premium" });
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(createCategoryMock).toHaveBeenCalledWith({ nome: "Body Splash" });
    expect(updateCategoryMock).toHaveBeenCalledWith({ id: 2, nome: "Body Splash" }, { nome: "Body Splash Premium" });
    expect(removeCategoryMock).toHaveBeenCalledWith({ id: 2, linkedProducts: 4, nome: "Body Splash Premium" });
    expect(result.current.categories).toEqual([{ id: 1, linkedProducts: 0, nome: "Perfumes" }]);
  });

  it("surfaces loading and submit errors", async () => {
    fetchCategoriesMock.mockRejectedValue(new Error("offline"));
    createCategoryMock.mockRejectedValue(new Error("save failed"));

    const { result } = renderHook(() => useCategoriesFacade());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Não foi possível carregar as categorias.");

    act(() => {
      result.current.openCreateForm();
    });

    await act(async () => {
      await expect(result.current.submitCategory({ nome: "Perfumes" })).rejects.toThrow("CATEGORIES_SUBMIT_FAILED");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Não foi possível salvar a categoria.");
    });
  });
});