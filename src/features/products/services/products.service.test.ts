import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createProductMock,
  deleteProductMock,
  listCategoriesMock,
  listProductsMock,
  updateProductMock,
} = vi.hoisted(() => ({
  createProductMock: vi.fn(),
  deleteProductMock: vi.fn(),
  listCategoriesMock: vi.fn(),
  listProductsMock: vi.fn(),
  updateProductMock: vi.fn(),
}));

vi.mock("../repository/products.repository", () => ({
  productsRepository: {
    createProduct: createProductMock,
    deleteProduct: deleteProductMock,
    listCategories: listCategoriesMock,
    listProducts: listProductsMock,
    updateProduct: updateProductMock,
  },
}));

import {
  createProduct,
  fetchProductCategories,
  fetchProducts,
  removeProduct,
  updateProduct,
} from "./products.service";

describe("productsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps listed products and categories", async () => {
    listProductsMock.mockResolvedValue({
      content: [{ id: 2, nome: "Libre", categoriaNome: "Perfumes", fkCategoria: 1, estoqueAtual: 7, precoVenda: 160, status: 1 }],
    });
    listCategoriesMock.mockResolvedValue([{ id: 2, nome: "Body Splash" }, { id: 1, nome: "Perfumes" }]);

    await expect(fetchProducts({ nome: "Libre", ordenacao: "nome,desc" })).resolves.toEqual([
      {
        ativo: 1,
        categoriaId: 1,
        categoriaNome: "Perfumes",
        estoqueAtual: 7,
        id: 2,
        margem: undefined,
        marca: "",
        medida: undefined,
        nome: "Libre",
        precoCompra: undefined,
        precoVenda: 160,
        volume: undefined,
      },
    ]);
    expect(listProductsMock).toHaveBeenCalledWith({ nome: "Libre", ordenacao: "nome,desc" });
    await expect(fetchProductCategories()).resolves.toEqual([
      { id: 2, nome: "Body Splash" },
      { id: 1, nome: "Perfumes" },
    ]);
  });

  it("creates and updates products with parsed request payloads", async () => {
    createProductMock.mockResolvedValue({ id: 5, nome: "Sauvage", categoriaNome: "Perfumes", fkCategoria: 1, estoqueAtual: 8, precoVenda: 150, status: 1 });
    updateProductMock.mockResolvedValue({ id: 5, nome: "Sauvage Elixir", categoriaNome: "Perfumes", fkCategoria: 1, estoqueAtual: 4, precoVenda: 180, status: 1 });

    const created = await createProduct({ categoriaId: "1", estoqueAtual: "8", hasVolume: false, marca: "Dior", medida: "ML", nome: "Sauvage", precoCompra: "", precoVenda: "150", volume: "" });
    const updated = await updateProduct({ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 8, id: 5, marca: "Dior", nome: "Sauvage", precoVenda: 150 }, { categoriaId: "1", estoqueAtual: "4", hasVolume: false, marca: "Dior", medida: "ML", nome: "Sauvage Elixir", precoCompra: "", precoVenda: "180", volume: "" });

    expect(createProductMock).toHaveBeenCalledWith({ estoqueAtual: 8, fkCategoria: 1, marca: "Dior", nome: "Sauvage", precoVenda: 150 });
    expect(updateProductMock).toHaveBeenCalledWith(5, { estoqueAtual: 4, fkCategoria: 1, marca: "Dior", nome: "Sauvage Elixir", precoVenda: 180 });
    expect(created.nome).toBe("Sauvage");
    expect(updated.nome).toBe("Sauvage Elixir");
  });

  it("removes a product and returns the deleted id", async () => {
    deleteProductMock.mockResolvedValue(undefined);

    await expect(removeProduct({ id: 9, nome: "Libre" })).resolves.toBe(9);
    expect(deleteProductMock).toHaveBeenCalledWith(9);
  });
});