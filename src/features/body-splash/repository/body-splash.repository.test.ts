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

import { bodySplashRepository } from "./body-splash.repository";

const emptyPage = {
  content: [], empty: true, first: true, last: true, number: 0,
  numberOfElements: 0, size: 10, totalElements: 0, totalPages: 0,
};
const payload = {
  produtoId: 7,
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
};

function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe("bodySplashRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists the flat Body Splash page from the exact endpoint", async () => {
    const page = {
      ...emptyPage,
      content: [{
        id: 11,
        produtoNome: "Lavanda & Ylang",
        preco10ml: 8,
        preco15ml: 11,
        preco20ml: 14,
        preco25ml: 17,
        preco30ml: 20,
      }],
    };
    apiClientGetMock.mockResolvedValue({ data: page });

    await expect(bodySplashRepository.listBodySplashes({ page: 2, size: 20 })).resolves.toEqual(page);
    expect(apiClientGetMock).toHaveBeenCalledWith("/body-splash", {
      params: { page: 2, size: 20 },
    });
  });

  it("sends search, page and size as query params", async () => {
    apiClientGetMock.mockResolvedValue({ data: emptyPage });
    const params = { busca: "Rosa", page: 1, size: 25 };

    await bodySplashRepository.listBodySplashes(params);

    expect(apiClientGetMock).toHaveBeenCalledWith("/body-splash", {
      params: { busca: "Rosa", page: 1, size: 25 },
    });
  });

  it("loads product options from the encoded Body Splash category with the required pagination and ordering", async () => {
    const productPage = { ...emptyPage, content: [{ id: 7, nome: "Lavanda & Ylang" }], size: 100 };
    apiClientGetMock.mockResolvedValue({ data: productPage });

    await expect(bodySplashRepository.listProducts()).resolves.toEqual(productPage);
    expect(apiClientGetMock).toHaveBeenCalledWith("/produtos/categoria/Body%20Splash", {
      params: { page: 0, size: 100, ordenacao: "nome,asc" },
    });
  });

  it.each([
    { products: [{ id: 7, nome: "Lavanda & Ylang" }] },
    { products: [] },
  ])("normalizes a direct category list into product content: $products", async ({ products }) => {
    apiClientGetMock.mockResolvedValue({ data: products });

    await expect(bodySplashRepository.listProducts()).resolves.toEqual({ content: products });
  });

  it("creates, updates and deletes with the flat OpenAPI payload", async () => {
    const response = { id: 11, produtoNome: "Lavanda & Ylang", ...payload };
    const { produtoId: _omittedProdutoId, ...responseWithoutProdutoId } = response;
    apiClientPostMock.mockResolvedValue({ data: responseWithoutProdutoId });
    apiClientPutMock.mockResolvedValue({ data: responseWithoutProdutoId });
    apiClientDeleteMock.mockResolvedValue({ data: undefined });

    await expect(bodySplashRepository.createBodySplash(payload)).resolves.toEqual(responseWithoutProdutoId);
    await expect(bodySplashRepository.updateBodySplash(11, payload)).resolves.toEqual(responseWithoutProdutoId);
    await expect(bodySplashRepository.deleteBodySplash(11)).resolves.toBeUndefined();
    expect(apiClientPostMock).toHaveBeenCalledWith("/body-splash", payload);
    expect(apiClientPutMock).toHaveBeenCalledWith("/body-splash/11", payload);
    expect(apiClientDeleteMock).toHaveBeenCalledWith("/body-splash/11");
  });

  it.each([
    ["list", "BODY_SPLASH_LIST_FAILED", () => bodySplashRepository.listBodySplashes(), apiClientGetMock],
    ["products list", "BODY_SPLASH_PRODUCTS_LIST_FAILED", () => bodySplashRepository.listProducts(), apiClientGetMock],
    ["create", "BODY_SPLASH_CREATE_FAILED", () => bodySplashRepository.createBodySplash(payload), apiClientPostMock],
    ["update", "BODY_SPLASH_UPDATE_FAILED", () => bodySplashRepository.updateBodySplash(11, payload), apiClientPutMock],
    ["delete", "BODY_SPLASH_DELETE_FAILED", () => bodySplashRepository.deleteBodySplash(11), apiClientDeleteMock],
  ])("preserves the %s error code and Axios status", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(422));
    await expect(request()).rejects.toThrow(`${code}:422`);
  });
});