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

import { decantsRepository } from "./decants.repository";

const emptyPage = {
  content: [], empty: true, first: true, last: true, number: 0,
  numberOfElements: 0, size: 10, totalElements: 0, totalPages: 0,
};
const payload = { perfumeId: 7, preco2ml: 12, preco3ml: 17, preco5ml: 25, preco10ml: 45 };

function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe("decantsRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists decants with pagination and optional perfume filter", async () => {
    apiClientGetMock.mockResolvedValue({ data: emptyPage });
    await expect(decantsRepository.listDecants({ page: 2, size: 20, perfumeId: 7 })).resolves.toEqual(emptyPage);
    expect(apiClientGetMock).toHaveBeenCalledWith("/decants", {
      params: { page: 2, size: 20, perfumeId: 7 },
    });
  });

  it("loads perfume options from products using the required ordering", async () => {
    const productPage = { ...emptyPage, content: [{ id: 7, nome: "Chanel N°5" }], size: 100 };
    apiClientGetMock.mockResolvedValue({ data: productPage });
    await expect(decantsRepository.listPerfumeProducts()).resolves.toEqual(productPage);
    expect(apiClientGetMock).toHaveBeenCalledWith("/produtos", {
      params: { page: 0, size: 100, ordenacao: "nome,asc" },
    });
  });

  it("creates, updates and deletes with the OpenAPI payload", async () => {
    const response = { id: 11, perfumeId: 7, perfumeNome: "Chanel N°5", precos: payload };
    apiClientPostMock.mockResolvedValue({ data: response });
    apiClientPutMock.mockResolvedValue({ data: response });
    apiClientDeleteMock.mockResolvedValue({ data: undefined });

    await expect(decantsRepository.createDecant(payload)).resolves.toEqual(response);
    await expect(decantsRepository.updateDecant(11, payload)).resolves.toEqual(response);
    await expect(decantsRepository.deleteDecant(11)).resolves.toBeUndefined();
    expect(apiClientPostMock).toHaveBeenCalledWith("/decants", payload);
    expect(apiClientPutMock).toHaveBeenCalledWith("/decants/11", payload);
    expect(apiClientDeleteMock).toHaveBeenCalledWith("/decants/11");
  });

  it.each([
    ["list", "DECANTS_LIST_FAILED", () => decantsRepository.listDecants(), apiClientGetMock],
    ["products list", "DECANTS_PRODUCTS_LIST_FAILED", () => decantsRepository.listPerfumeProducts(), apiClientGetMock],
    ["create", "DECANTS_CREATE_FAILED", () => decantsRepository.createDecant(payload), apiClientPostMock],
    ["update", "DECANTS_UPDATE_FAILED", () => decantsRepository.updateDecant(11, payload), apiClientPutMock],
    ["delete", "DECANTS_DELETE_FAILED", () => decantsRepository.deleteDecant(11), apiClientDeleteMock],
  ])("preserves the %s error code and Axios status", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(422));
    await expect(request()).rejects.toThrow(`${code}:422`);
  });
});