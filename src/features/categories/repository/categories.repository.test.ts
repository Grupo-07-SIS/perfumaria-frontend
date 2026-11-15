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

import { categoriesRepository } from "./categories.repository";

function axiosError(status: number) {
  return {
    isAxiosError: true,
    response: { status },
  };
}

describe("categoriesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists categories from the backend", async () => {
    apiClientGetMock.mockResolvedValue({ data: [{ id: 1, nome: "Perfumes", qtdProdVinculados: 3 }] });

    const result = await categoriesRepository.listCategories();

    expect(apiClientGetMock).toHaveBeenCalledWith("/categorias");
    expect(result).toEqual([{ id: 1, nome: "Perfumes", qtdProdVinculados: 3 }]);
  });

  it("creates a category using the categories endpoint", async () => {
    apiClientPostMock.mockResolvedValue({ data: { id: 2, nome: "Body Splash", qtdProdVinculados: 0 } });

    const result = await categoriesRepository.createCategory({ nome: "Body Splash" });

    expect(apiClientPostMock).toHaveBeenCalledWith("/categorias", { nome: "Body Splash" });
    expect(result).toEqual({ id: 2, nome: "Body Splash", qtdProdVinculados: 0 });
  });

  it("updates and deletes categories using the id path", async () => {
    apiClientPutMock.mockResolvedValue({ data: { id: 3, nome: "Kits", qtdProdVinculados: 1 } });
    apiClientDeleteMock.mockResolvedValue({ data: undefined });

    const updated = await categoriesRepository.updateCategory(3, { nome: "Kits" });
    await categoriesRepository.deleteCategory(3);

    expect(apiClientPutMock).toHaveBeenCalledWith("/categorias/3", { nome: "Kits" });
    expect(apiClientDeleteMock).toHaveBeenCalledWith("/categorias/3");
    expect(updated).toEqual({ id: 3, nome: "Kits", qtdProdVinculados: 1 });
  });

  it.each([
    ["list", "CATEGORIES_LIST_FAILED", () => categoriesRepository.listCategories(), apiClientGetMock],
    ["create", "CATEGORIES_CREATE_FAILED", () => categoriesRepository.createCategory({ nome: "Kits" }), apiClientPostMock],
    ["update", "CATEGORIES_UPDATE_FAILED", () => categoriesRepository.updateCategory(3, { nome: "Kits" }), apiClientPutMock],
    ["delete", "CATEGORIES_DELETE_FAILED", () => categoriesRepository.deleteCategory(3), apiClientDeleteMock],
  ])("preserves the %s error code and Axios response status", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(409));

    await expect(request()).rejects.toThrow(`${code}:409`);
  });
});