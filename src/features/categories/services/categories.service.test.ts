import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createCategoryMock,
  deleteCategoryMock,
  listCategoriesMock,
  updateCategoryMock,
} = vi.hoisted(() => ({
  createCategoryMock: vi.fn(),
  deleteCategoryMock: vi.fn(),
  listCategoriesMock: vi.fn(),
  updateCategoryMock: vi.fn(),
}));

vi.mock("../repository/categories.repository", () => ({
  categoriesRepository: {
    createCategory: createCategoryMock,
    deleteCategory: deleteCategoryMock,
    listCategories: listCategoriesMock,
    updateCategory: updateCategoryMock,
  },
}));

import { createCategory, fetchCategories, removeCategory, updateCategory } from "./categories.service";

describe("categoriesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps listed categories to the feature model", async () => {
    listCategoriesMock.mockResolvedValue([{ id: 1, nome: "Perfumes", qtdProdVinculados: 5 }]);

    await expect(fetchCategories()).resolves.toEqual([{ id: 1, linkedProducts: 5, nome: "Perfumes" }]);
  });

  it("creates and updates categories with trimmed payloads", async () => {
    createCategoryMock.mockResolvedValue({ id: 2, nome: "Body Splash", qtdProdVinculados: 0 });
    updateCategoryMock.mockResolvedValue({ id: 2, nome: "Kits", qtdProdVinculados: 1 });

    const created = await createCategory({ nome: "  Body Splash  " });
    const updated = await updateCategory({ id: 2, nome: "Body Splash" }, { nome: " Kits " });

    expect(createCategoryMock).toHaveBeenCalledWith({ nome: "Body Splash" });
    expect(updateCategoryMock).toHaveBeenCalledWith(2, { nome: "Kits" });
    expect(created).toEqual({ id: 2, linkedProducts: 0, nome: "Body Splash" });
    expect(updated).toEqual({ id: 2, linkedProducts: 1, nome: "Kits" });
  });

  it("removes a category and returns the deleted id", async () => {
    deleteCategoryMock.mockResolvedValue(undefined);

    await expect(removeCategory({ id: 7, linkedProducts: 3, nome: "Colônias" })).resolves.toBe(7);
    expect(deleteCategoryMock).toHaveBeenCalledWith(7);
  });
});