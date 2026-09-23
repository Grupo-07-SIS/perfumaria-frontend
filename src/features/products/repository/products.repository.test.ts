import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientDeleteMock, apiClientGetMock, apiClientPostMock, apiClientPutMock } = vi.hoisted(() => ({
  apiClientDeleteMock: vi.fn(),
  apiClientGetMock: vi.fn(),
  apiClientPostMock: vi.fn(),
  apiClientPutMock: vi.fn(),
}));

vi.mock("../../../core/services/http-client", () => ({
  apiClient: {
    delete: apiClientDeleteMock,
    get: apiClientGetMock,
    post: apiClientPostMock,
    put: apiClientPutMock,
  },
}));

import { productsRepository } from "./products.repository";

const emptyPage = {
  content: [],
  empty: true,
  first: true,
  last: true,
  number: 0,
  numberOfElements: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe("productsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists paged products with the default query params", async () => {
    apiClientGetMock.mockResolvedValue({ data: emptyPage });

    const result = await productsRepository.listProducts();

    expect(apiClientGetMock).toHaveBeenCalledWith("/produtos", {
      params: { ordenacao: "nome,asc", page: 0, size: 10 },
    });
    expect(result).toEqual(emptyPage);
  });

  it("sends trimmed search, stock, category, ordering, and page params", async () => {
    apiClientGetMock.mockResolvedValue({ data: emptyPage });

    await productsRepository.listProducts({ categoriaId: 2, estoqueMax: 0, estoqueMin: 0, nome: "  Chance  ", ordenacao: "marca,desc", page: 1 });

    expect(apiClientGetMock).toHaveBeenCalledWith("/produtos", {
      params: {
        categoriaId: 2,
        estoqueMax: 0,
        estoqueMin: 0,
        nome: "Chance",
        ordenacao: "marca,desc",
        page: 1,
        size: 10,
      },
    });
  });

  it("lists product categories", async () => {
    apiClientGetMock.mockResolvedValue({ data: [{ id: 1, nome: "Perfumes" }] });

    const result = await productsRepository.listCategories();

    expect(apiClientGetMock).toHaveBeenCalledWith("/categorias");
    expect(result).toEqual([{ id: 1, nome: "Perfumes" }]);
  });

  it("creates a product with request data", async () => {
    const payload = { estoqueAtual: 8, fkCategoria: 1, nome: "Sauvage", precoVenda: 150 };
    apiClientPostMock.mockResolvedValue({ data: { id: 5, ...payload } });

    const result = await productsRepository.createProduct(payload);

    expect(apiClientPostMock).toHaveBeenCalledWith("/produtos", payload);
    expect(result.id).toBe(5);
  });

  it("updates a product using its id and request data", async () => {
    const payload = { estoqueAtual: 4, fkCategoria: 1, nome: "Sauvage Elixir", precoVenda: 180 };
    apiClientPutMock.mockResolvedValue({ data: { id: 5, ...payload } });

    const result = await productsRepository.updateProduct(5, payload);

    expect(apiClientPutMock).toHaveBeenCalledWith("/produtos/5", payload);
    expect(result.nome).toBe("Sauvage Elixir");
  });

  it("deletes a product using its id", async () => {
    apiClientDeleteMock.mockResolvedValue({ data: undefined });

    await productsRepository.deleteProduct(9);

    expect(apiClientDeleteMock).toHaveBeenCalledWith("/produtos/9");
  });

  it.each([
    ["list", "PRODUCTS_LIST_FAILED", () => productsRepository.listProducts(), apiClientGetMock],
    ["category list", "PRODUCTS_CATEGORIES_LIST_FAILED", () => productsRepository.listCategories(), apiClientGetMock],
    ["create", "PRODUCTS_CREATE_FAILED", () => productsRepository.createProduct({ estoqueAtual: 1, fkCategoria: 1, nome: "Chance", precoVenda: 100 }), apiClientPostMock],
    ["update", "PRODUCTS_UPDATE_FAILED", () => productsRepository.updateProduct(4, { estoqueAtual: 1, fkCategoria: 1, nome: "Chance", precoVenda: 100 }), apiClientPutMock],
    ["delete", "PRODUCTS_DELETE_FAILED", () => productsRepository.deleteProduct(4), apiClientDeleteMock],
  ])("preserves the %s error code and Axios response status", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(422));

    await expect(request()).rejects.toThrow(`${code}:422`);
  });
});