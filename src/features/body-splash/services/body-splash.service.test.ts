import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createBodySplashMock,
  deleteBodySplashMock,
  listBodySplashesMock,
  listProductsMock,
  updateBodySplashMock,
} = vi.hoisted(() => ({
  createBodySplashMock: vi.fn(),
  deleteBodySplashMock: vi.fn(),
  listBodySplashesMock: vi.fn(),
  listProductsMock: vi.fn(),
  updateBodySplashMock: vi.fn(),
}));

vi.mock("../repository/body-splash.repository", () => ({
  bodySplashRepository: {
    createBodySplash: createBodySplashMock,
    deleteBodySplash: deleteBodySplashMock,
    listBodySplashes: listBodySplashesMock,
    listProducts: listProductsMock,
    updateBodySplash: updateBodySplashMock,
  },
}));

import {
  createBodySplash,
  BODY_SPLASH_ALREADY_LINKED,
  fetchBodySplashCatalog,
  removeBodySplash,
  updateBodySplash,
  validateBodySplash,
} from "./body-splash.service";

const formData = {
  produtoId: "7",
  precos: {
    preco10ml: "8",
    preco15ml: "11",
    preco20ml: "14",
    preco25ml: "17",
    preco30ml: "20",
  },
};
const request = {
  produtoId: 7,
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
};
const response = {
  id: 11,
  produtoNome: "  Lavanda & Ylang  ",
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
};
const model = {
  id: 11,
  produtoId: 7,
  produto: "  Lavanda & Ylang  ",
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
};

describe("bodySplashService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listBodySplashesMock.mockResolvedValue({ content: [], number: 0, totalElements: 0, totalPages: 0 });
  });

  it("reconciles response names with product options ignoring trim and case", async () => {
    listBodySplashesMock.mockResolvedValue({ content: [response], number: 0, totalElements: 1, totalPages: 1 });
    listProductsMock.mockResolvedValue({
      content: [{ id: 8, nome: "Rosa & Baunilha" }, { id: 7, nome: "lavanda & ylang" }],
    });

    await expect(fetchBodySplashCatalog()).resolves.toEqual({
      page: { content: [model], number: 0, totalElements: 1, totalPages: 1 },
      productOptions: [{ id: 7, nome: "lavanda & ylang" }, { id: 8, nome: "Rosa & Baunilha" }],
      productOptionsError: "",
    });
    expect(listBodySplashesMock).toHaveBeenCalledWith();
    expect(listProductsMock).toHaveBeenCalledWith();
  });

  it("forwards the remote search while preserving product option reconciliation", async () => {
    listBodySplashesMock.mockResolvedValue({ content: [response], number: 0, totalElements: 1, totalPages: 1 });
    listProductsMock.mockResolvedValue({
      content: [{ id: 8, nome: "Rosa & Baunilha" }, { id: 7, nome: "lavanda & ylang" }],
    });

    await expect(fetchBodySplashCatalog({ busca: "Lavanda", page: 0, size: 10 })).resolves.toEqual({
      page: { content: [model], number: 0, totalElements: 1, totalPages: 1 },
      productOptions: [{ id: 7, nome: "lavanda & ylang" }, { id: 8, nome: "Rosa & Baunilha" }],
      productOptionsError: "",
    });
    expect(listBodySplashesMock).toHaveBeenCalledWith({ busca: "Lavanda", page: 0, size: 10 });
  });

  it("keeps Body Splash prices when category options fail and reports the failure", async () => {
    listBodySplashesMock.mockResolvedValue({ content: [response], number: 0, totalElements: 1, totalPages: 1 });
    listProductsMock.mockRejectedValueOnce(new Error("BODY_SPLASH_PRODUCTS_LIST_FAILED:404"));

    const catalog = await fetchBodySplashCatalog();

    expect(catalog.page.content).toEqual([{ ...model, produtoId: undefined }]);
    expect(catalog.productOptions).toEqual([]);
    expect(catalog.productOptionsError).toContain("Body Splash para vínculo");
  });

  it("still rejects when the Body Splash price list fails", async () => {
    listBodySplashesMock.mockRejectedValueOnce(new Error("BODY_SPLASH_LIST_FAILED:503"));
    listProductsMock.mockResolvedValue({ content: [] });

    await expect(fetchBodySplashCatalog()).rejects.toThrow("BODY_SPLASH_LIST_FAILED:503");
  });

  it("preserves an unmatched response name with an undefined product id", async () => {
    listBodySplashesMock.mockResolvedValue({
      content: [{ ...response, produtoNome: "Produto legado" }],
      number: 0,
      totalElements: 1,
      totalPages: 1,
    });
    listProductsMock.mockResolvedValue({ content: [{ id: 7, nome: "Lavanda & Ylang" }] });

    const catalog = await fetchBodySplashCatalog();
    expect(catalog.page.content[0]).toMatchObject({
      produto: "Produto legado",
      produtoId: undefined,
    });
  });

  it("maps create and update forms and restores the submitted product id", async () => {
    createBodySplashMock.mockResolvedValue({ ...response, produtoNome: "Lavanda & Ylang" });
    updateBodySplashMock.mockResolvedValue({ ...response, produtoNome: "Lavanda & Ylang", preco10ml: 9 });

    await expect(createBodySplash(formData)).resolves.toEqual({ ...model, produto: "Lavanda & Ylang" });
    await expect(updateBodySplash(model, {
      ...formData,
      precos: { ...formData.precos, preco10ml: "9" },
    })).resolves.toEqual({ ...model, produto: "Lavanda & Ylang", preco10ml: 9 });
    expect(createBodySplashMock).toHaveBeenCalledWith(request);
    expect(updateBodySplashMock).toHaveBeenCalledWith(11, { ...request, preco10ml: 9 });
  });

  it("blocks an existing product link using a server-side ID filter before posting", async () => {
    listBodySplashesMock.mockResolvedValue({ content: [response], totalElements: 1 });
    await expect(createBodySplash(formData)).rejects.toThrow(BODY_SPLASH_ALREADY_LINKED);
    expect(listBodySplashesMock).toHaveBeenCalledWith({ produtoId: 7, page: 0, size: 1 });
    expect(createBodySplashMock).not.toHaveBeenCalled();
  });

  it("does not post when checking the existing link fails", async () => {
    listBodySplashesMock.mockRejectedValueOnce(new Error("BODY_SPLASH_LIST_FAILED:503"));
    await expect(createBodySplash(formData)).rejects.toThrow("BODY_SPLASH_LIST_FAILED:503");
    expect(createBodySplashMock).not.toHaveBeenCalled();
  });

  it("reports a conflict if another request created the link after checking", async () => {
    createBodySplashMock.mockRejectedValueOnce(new Error("BODY_SPLASH_CREATE_FAILED:409"));
    await expect(createBodySplash(formData)).rejects.toThrow(BODY_SPLASH_ALREADY_LINKED);
  });

  it("deletes a Body Splash and returns its id", async () => {
    deleteBodySplashMock.mockResolvedValue(undefined);
    await expect(removeBodySplash(model)).resolves.toBe(11);
    expect(deleteBodySplashMock).toHaveBeenCalledWith(11);
  });

  it("rejects a form without a resolved product id", () => {
    expect(validateBodySplash({ ...formData, produtoId: "" })).toBe("Selecione um Body Splash.");
  });
});