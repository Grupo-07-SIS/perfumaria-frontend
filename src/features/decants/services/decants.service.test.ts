import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createDecantMock,
  deleteDecantMock,
  listDecantsMock,
  listPerfumeProductsMock,
  updateDecantMock,
} = vi.hoisted(() => ({
  createDecantMock: vi.fn(),
  deleteDecantMock: vi.fn(),
  listDecantsMock: vi.fn(),
  listPerfumeProductsMock: vi.fn(),
  updateDecantMock: vi.fn(),
}));

vi.mock("../repository/decants.repository", () => ({
  decantsRepository: {
    createDecant: createDecantMock,
    deleteDecant: deleteDecantMock,
    listDecants: listDecantsMock,
    listPerfumeProducts: listPerfumeProductsMock,
    updateDecant: updateDecantMock,
  },
}));

import {
  createDecant,
  DECANT_ALREADY_LINKED,
  fetchDecants,
  fetchPerfumeOptions,
  removeDecant,
  updateDecant,
} from "./decants.service";

const formData = { perfumeId: "7", preco2ml: "12", preco3ml: "17", preco5ml: "25", preco10ml: "45" };
const request = { perfumeId: 7, preco2ml: 12, preco3ml: 17, preco5ml: 25, preco10ml: 45 };
const response = { id: 11, perfumeNome: "Chanel N°5", ...request };
const model = { id: 11, perfumeId: 7, perfume: "Chanel N°5", preco2ml: 12, preco3ml: 17, preco5ml: 25, preco10ml: 45 };

describe("decantsService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listDecantsMock.mockResolvedValue({ content: [], number: 0, totalElements: 0, totalPages: 0 });
  });

  it("maps the decants page and product content into feature models", async () => {
    listDecantsMock.mockResolvedValue({ content: [response], number: 0, totalElements: 1, totalPages: 1 });
    listPerfumeProductsMock.mockResolvedValue({ content: [{ id: 8, nome: "Libre" }, { id: 7, nome: "Chanel N°5" }] });

    await expect(fetchDecants({ page: 0, size: 10, perfumeId: 7 })).resolves.toEqual({
      content: [model], number: 0, totalElements: 1, totalPages: 1,
    });
    await expect(fetchPerfumeOptions()).resolves.toEqual([
      { id: 7, nome: "Chanel N°5" },
      { id: 8, nome: "Libre" },
    ]);
    expect(listDecantsMock).toHaveBeenCalledWith({ page: 0, size: 10, perfumeId: 7 });
  });

  it("maps create and update forms and returns the saved model", async () => {
    createDecantMock.mockResolvedValue(response);
    updateDecantMock.mockResolvedValue({ ...response, preco2ml: 14 });

    await expect(createDecant(formData)).resolves.toEqual(model);
    await expect(updateDecant(model, { ...formData, preco2ml: "14" })).resolves.toEqual({ ...model, preco2ml: 14 });
    expect(createDecantMock).toHaveBeenCalledWith(request);
    expect(updateDecantMock).toHaveBeenCalledWith(11, { ...request, preco2ml: 14 });
  });

  it("blocks an existing perfume link using a server-side ID filter before posting", async () => {
    listDecantsMock.mockResolvedValue({ content: [response], totalElements: 1 });
    await expect(createDecant(formData)).rejects.toThrow(DECANT_ALREADY_LINKED);
    expect(listDecantsMock).toHaveBeenCalledWith({ perfumeId: 7, page: 0, size: 1 });
    expect(createDecantMock).not.toHaveBeenCalled();
  });

  it("does not post when checking the existing link fails", async () => {
    listDecantsMock.mockRejectedValueOnce(new Error("DECANTS_LIST_FAILED:503"));
    await expect(createDecant(formData)).rejects.toThrow("DECANTS_LIST_FAILED:503");
    expect(createDecantMock).not.toHaveBeenCalled();
  });

  it("reports a conflict if another request created the link after checking", async () => {
    createDecantMock.mockRejectedValueOnce(new Error("DECANTS_CREATE_FAILED:409"));
    await expect(createDecant(formData)).rejects.toThrow(DECANT_ALREADY_LINKED);
  });

  it("deletes a decant and returns its id", async () => {
    deleteDecantMock.mockResolvedValue(undefined);
    await expect(removeDecant(model)).resolves.toBe(11);
    expect(deleteDecantMock).toHaveBeenCalledWith(11);
  });
});