import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createDecantMock,
  fetchDecantsMock,
  fetchPerfumeOptionsMock,
  removeDecantMock,
  updateDecantMock,
} = vi.hoisted(() => ({
  createDecantMock: vi.fn(),
  fetchDecantsMock: vi.fn(),
  fetchPerfumeOptionsMock: vi.fn(),
  removeDecantMock: vi.fn(),
  updateDecantMock: vi.fn(),
}));

vi.mock("../services/decants.service", () => ({
  createDecant: createDecantMock,
  fetchDecants: fetchDecantsMock,
  fetchPerfumeOptions: fetchPerfumeOptionsMock,
  removeDecant: removeDecantMock,
  updateDecant: updateDecantMock,
}));

import { useDecantsFacade } from "./useDecantsFacade";

const original = { id: 1, perfumeId: 7, perfume: "Chanel N°5", preco2ml: 12, preco3ml: 17, preco5ml: 25, preco10ml: 45 };
const created = { id: 2, perfumeId: 8, perfume: "Libre", preco2ml: 13, preco3ml: 18, preco5ml: 26, preco10ml: 47 };
const formData = { perfumeId: "8", preco2ml: "13", preco3ml: "18", preco5ml: "26", preco10ml: "47" };

describe("useDecantsFacade", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchDecantsMock.mockResolvedValue({ content: [original], number: 0, totalElements: 1, totalPages: 1 });
    fetchPerfumeOptionsMock.mockResolvedValue([{ id: 7, nome: "Chanel N°5" }, { id: 8, nome: "Libre" }]);
  });

  it("loads decants and perfume options on mount and exposes loading state", async () => {
    const { result } = renderHook(() => useDecantsFacade());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchDecantsMock).toHaveBeenCalledTimes(1);
    expect(fetchPerfumeOptionsMock).toHaveBeenCalledTimes(1);
    expect(result.current.decants).toEqual([original]);
    expect(result.current.perfumeOptions).toEqual([{ id: 7, nome: "Chanel N°5" }, { id: 8, nome: "Libre" }]);
    expect(result.current.error).toBe("");
  });

  it("keeps decants visible and warns when category options fail", async () => {
    fetchPerfumeOptionsMock.mockRejectedValueOnce(new Error("DECANTS_PRODUCTS_LIST_FAILED:404"));
    const { result } = renderHook(() => useDecantsFacade());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.decants).toEqual([original]);
    expect(result.current.totalElements).toBe(1);
    expect(result.current.perfumeOptions).toEqual([]);
    expect(result.current.error).toContain("perfumes para vínculo");
  });

  it("loads and exposes the pagination metadata returned by the backend", async () => {
    fetchDecantsMock.mockResolvedValue({ content: [original], number: 1, totalElements: 23, totalPages: 3 });

    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchDecantsMock).toHaveBeenCalledWith({ busca: "", page: 0, size: 10 });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalElements).toBe(23);
    expect(result.current.totalPages).toBe(3);
  });

  it("keeps the server page intact while editing and searches remotely on submit", async () => {
    fetchDecantsMock
      .mockResolvedValueOnce({ content: [original], number: 0, totalElements: 1, totalPages: 1 })
      .mockResolvedValueOnce({ content: [created], number: 0, totalElements: 1, totalPages: 1 });

    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch("Libre"));
    expect(result.current.filtered).toEqual([original]);
    expect(fetchDecantsMock).toHaveBeenCalledTimes(1);

    await act(async () => result.current.submitSearch());

    expect(fetchDecantsMock).toHaveBeenLastCalledWith({ busca: "Libre", page: 0, size: 10 });
    expect(result.current.filtered).toEqual([created]);
    expect(result.current.currentPage).toBe(1);
  });

  it("searches remotely while typing without requiring submit", async () => {
    fetchDecantsMock
      .mockResolvedValueOnce({ content: [original], number: 0, totalElements: 1, totalPages: 1 })
      .mockResolvedValueOnce({ content: [created], number: 0, totalElements: 1, totalPages: 1 });

    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch(" Lib "));

    await waitFor(() => expect(result.current.filtered).toEqual([created]));
    expect(fetchDecantsMock).toHaveBeenCalledTimes(2);
    expect(fetchDecantsMock).toHaveBeenLastCalledWith({ busca: "Lib", page: 0, size: 10 });
    expect(result.current.currentPage).toBe(1);
  });

  it("ignores stale list responses that resolve after a newer search", async () => {
    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let resolveOldPage!: (value: unknown) => void;
    fetchDecantsMock
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOldPage = resolve; }))
      .mockResolvedValueOnce({ content: [created], number: 0, totalElements: 1, totalPages: 1 });

    let oldPagePromise!: Promise<void>;
    act(() => { oldPagePromise = result.current.setCurrentPage(2); });
    act(() => result.current.setSearch("Libre"));
    await act(async () => result.current.submitSearch());
    await act(async () => {
      resolveOldPage({ content: [original], number: 1, totalElements: 11, totalPages: 2 });
      await oldPagePromise;
    });

    expect(result.current.filtered).toEqual([created]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("converts the one-based UI page to the zero-based API page", async () => {
    fetchDecantsMock.mockImplementation(async ({ page = 0 } = {}) => ({
      content: page === 2 ? [created] : [original],
      number: page,
      totalElements: 23,
      totalPages: 3,
    }));

    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.setCurrentPage(3));

    expect(fetchDecantsMock).toHaveBeenLastCalledWith({ busca: "", page: 2, size: 10 });
    expect(result.current.currentPage).toBe(3);
    expect(result.current.filtered).toEqual([created]);
  });

  it("surfaces list failures without keeping stale loading state", async () => {
    fetchDecantsMock.mockRejectedValue(new Error("DECANTS_LIST_FAILED:503"));
    fetchPerfumeOptionsMock.mockRejectedValue(new Error("DECANTS_PRODUCTS_LIST_FAILED:503"));
    const { result } = renderHook(() => useDecantsFacade());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.decants).toEqual([]);
    expect(result.current.perfumeOptions).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  it("adds a created decant only after the backend succeeds", async () => {
    let resolveCreate!: (value: typeof created) => void;
    createDecantMock.mockImplementation(() => new Promise((resolve) => { resolveCreate = resolve; }));
    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setShowModal(true));

    let savePromise!: Promise<void>;
    act(() => { savePromise = result.current.handleSave(formData); });
    expect(result.current.decants).toEqual([original]);
    expect(result.current.showModal).toBe(true);

    await act(async () => {
      resolveCreate(created);
      await savePromise;
    });
    expect(result.current.decants).toEqual([original, created]);
    expect(result.current.showModal).toBe(false);
  });

  it("updates and deletes only after successful service calls", async () => {
    updateDecantMock.mockResolvedValue({ ...original, preco2ml: 14 });
    removeDecantMock.mockResolvedValue(1);
    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setEditDecant(original));
    await act(async () => {
      await result.current.handleSave({ ...formData, perfumeId: "7", preco2ml: "14" });
    });
    expect(result.current.decants).toEqual([{ ...original, preco2ml: 14 }]);
    expect(updateDecantMock).toHaveBeenCalledWith(original, { ...formData, perfumeId: "7", preco2ml: "14" });

    act(() => result.current.setDeleteDecant({ ...original, preco2ml: 14 }));
    await act(async () => { await result.current.confirmDelete(); });
    expect(result.current.decants).toEqual([]);
    expect(result.current.deleteDecant).toBeNull();
  });

  it("keeps state and targets intact when a mutation fails", async () => {
    createDecantMock.mockRejectedValue(new Error("DECANTS_CREATE_FAILED:500"));
    removeDecantMock.mockRejectedValue(new Error("DECANTS_DELETE_FAILED:500"));
    const { result } = renderHook(() => useDecantsFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setShowModal(true));
    await act(async () => {
      await expect(result.current.handleSave(formData)).rejects.toThrow();
    });
    expect(result.current.decants).toEqual([original]);
    expect(result.current.showModal).toBe(true);

    act(() => result.current.setDeleteDecant(original));
    await act(async () => { await result.current.confirmDelete(); });
    expect(result.current.decants).toEqual([original]);
    expect(result.current.deleteDecant).toEqual(original);
    expect(result.current.error).toBeTruthy();
  });
});