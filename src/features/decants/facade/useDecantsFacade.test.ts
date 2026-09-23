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