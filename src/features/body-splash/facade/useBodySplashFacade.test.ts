import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../core/store/AppContext", () => ({
  useApp: () => ({ currentUser: { cargo: "Administrador" } }),
}));

const {
  createBodySplashMock,
  fetchBodySplashCatalogMock,
  removeBodySplashMock,
  updateBodySplashMock,
} = vi.hoisted(() => ({
  createBodySplashMock: vi.fn(),
  fetchBodySplashCatalogMock: vi.fn(),
  removeBodySplashMock: vi.fn(),
  updateBodySplashMock: vi.fn(),
}));

vi.mock("../services/body-splash.service", () => ({
  createBodySplash: createBodySplashMock,
  fetchBodySplashCatalog: fetchBodySplashCatalogMock,
  removeBodySplash: removeBodySplashMock,
  updateBodySplash: updateBodySplashMock,
}));

import { useBodySplashFacade } from "./useBodySplashFacade";

const original = {
  id: 1,
  produtoId: 7,
  produto: "Lavanda & Ylang",
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
};
const created = {
  id: 2,
  produtoId: 8,
  produto: "Rosa & Baunilha",
  preco10ml: 9,
  preco15ml: 12,
  preco20ml: 15,
  preco25ml: 18,
  preco30ml: 21,
};
const formData = {
  produtoId: "8",
  precos: {
    preco10ml: "9",
    preco15ml: "12",
    preco20ml: "15",
    preco25ml: "18",
    preco30ml: "21",
  },
};
const productOptions = [
  { id: 7, nome: "Lavanda & Ylang" },
  { id: 8, nome: "Rosa & Baunilha" },
];

describe("useBodySplashFacade", () => {
  it("consulta paginas remotas e retorna ao inicio ao buscar", async () => {
    fetchBodySplashCatalogMock.mockImplementation(async ({ page = 0 } = {}) => ({
      page: { content: page === 2 ? [created] : [original], number: page, totalElements: 21, totalPages: 3 }, productOptions,
    }));
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => { await result.current.setCurrentPage(3); });
    expect(fetchBodySplashCatalogMock).toHaveBeenLastCalledWith({ busca: "", page: 2, size: 10 });
    expect(result.current).toMatchObject({ currentPage: 3, totalPages: 3, totalElements: 21, firstItem: 21, lastItem: 21 });
    act(() => result.current.setSearch("Rosa"));
    await act(async () => { await result.current.submitSearch(); });
    expect(result.current.currentPage).toBe(1);
    expect(fetchBodySplashCatalogMock).toHaveBeenLastCalledWith({ busca: "Rosa", page: 0, size: 10 });
  });

  beforeEach(() => {
    vi.resetAllMocks();
    fetchBodySplashCatalogMock.mockResolvedValue({
      page: { content: [original], number: 0, totalElements: 1, totalPages: 1 },
      productOptions,
    });
  });

  it("loads items and product options on mount and exposes loading state", async () => {
    const { result } = renderHook(() => useBodySplashFacade());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchBodySplashCatalogMock).toHaveBeenCalledTimes(1);
    expect(result.current.items).toEqual([original]);
    expect(result.current.productOptions).toEqual(productOptions);
    expect(result.current.error).toBe("");
  });

  it("volta a pagina anterior ao excluir o unico item da ultima pagina", async () => {
    let records = [...Array.from({ length: 10 }, (_, index) => ({ ...original, id: index + 100 })), created];
    fetchBodySplashCatalogMock.mockImplementation(async ({ page = 0, size = 10 } = {}) => ({
      page: { content: records.slice(page * size, (page + 1) * size), number: page, totalElements: records.length, totalPages: Math.ceil(records.length / size) }, productOptions,
    }));
    removeBodySplashMock.mockImplementation(async item => {
      records = records.filter(record => record.id !== item.id);
      return item.id;
    });
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => { await result.current.setCurrentPage(2); });
    act(() => result.current.setDeleteItem(created));
    await act(async () => { await result.current.confirmDelete(); });
    expect(result.current).toMatchObject({ currentPage: 1, totalPages: 1, totalElements: 10, firstItem: 1, lastItem: 10 });
    expect(result.current.filtered).toHaveLength(10);
  });

  it("shows category option failures without hiding prices on mount or search", async () => {
    const warning = "Não foi possível carregar os produtos Body Splash para vínculo.";
    fetchBodySplashCatalogMock.mockResolvedValue({
      page: { content: [original], number: 0, totalElements: 1, totalPages: 1 },
      productOptions: [],
      productOptionsError: warning,
    });
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([original]);
    expect(result.current.productOptions).toEqual([]);
    expect(result.current.error).toBe(warning);

    act(() => result.current.setSearch("Lavanda"));
    await act(async () => result.current.submitSearch());

    expect(result.current.items).toEqual([original]);
    expect(result.current.error).toBe(warning);
  });

  it("keeps the current backend results intact while the search text is edited", async () => {
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch("Rosa"));

    expect(result.current.filtered).toEqual([original]);
    expect(fetchBodySplashCatalogMock).toHaveBeenCalledTimes(1);
  });

  it("replaces the current results with the reconciled backend response on search submit", async () => {
    fetchBodySplashCatalogMock
      .mockResolvedValueOnce({
        page: { content: [original], number: 0, totalElements: 1, totalPages: 1 },
        productOptions,
      })
      .mockResolvedValueOnce({
        page: { content: [created], number: 0, totalElements: 1, totalPages: 1 },
        productOptions,
      });
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch("Rosa"));
    await act(async () => result.current.submitSearch());

    expect(fetchBodySplashCatalogMock).toHaveBeenLastCalledWith({ busca: "Rosa", page: 0, size: 10 });
    expect(result.current.filtered).toEqual([created]);
    expect(result.current.productOptions).toEqual(productOptions);
  });

  it("searches remotely while typing without requiring submit", async () => {
    fetchBodySplashCatalogMock
      .mockResolvedValueOnce({
        page: { content: [original], number: 0, totalElements: 1, totalPages: 1 },
        productOptions,
      })
      .mockResolvedValueOnce({
        page: { content: [created], number: 0, totalElements: 1, totalPages: 1 },
        productOptions,
      });
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch(" Ro "));

    await waitFor(() => expect(result.current.filtered).toEqual([created]));
    expect(fetchBodySplashCatalogMock).toHaveBeenCalledTimes(2);
    expect(fetchBodySplashCatalogMock).toHaveBeenLastCalledWith({ busca: "Ro", page: 0, size: 10 });
  });

  it("ignores stale search responses that resolve after a newer search", async () => {
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let resolveOldSearch!: (value: unknown) => void;
    fetchBodySplashCatalogMock
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOldSearch = resolve; }))
      .mockResolvedValueOnce({
        page: { content: [created], number: 0, totalElements: 1, totalPages: 1 },
        productOptions,
      });

    act(() => result.current.setSearch("La"));
    let oldSearchPromise!: Promise<void>;
    act(() => { oldSearchPromise = result.current.submitSearch(); });
    act(() => result.current.setSearch("Rosa"));
    await act(async () => result.current.submitSearch());
    await act(async () => {
      resolveOldSearch({
        page: { content: [original], number: 0, totalElements: 1, totalPages: 1 },
        productOptions,
      });
      await oldSearchPromise;
    });

    expect(result.current.filtered).toEqual([created]);
    expect(result.current.isLoading).toBe(false);
  });

  it("surfaces list failures without keeping stale loading state", async () => {
    fetchBodySplashCatalogMock.mockRejectedValue(new Error("BODY_SPLASH_LIST_FAILED:503"));
    const { result } = renderHook(() => useBodySplashFacade());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([]);
    expect(result.current.productOptions).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  it("adds a created item only after the backend succeeds", async () => {
    let resolveCreate!: (value: typeof created) => void;
    createBodySplashMock.mockImplementation(() => new Promise((resolve) => { resolveCreate = resolve; }));
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setShowModal(true));

    let savePromise!: Promise<void>;
    act(() => { savePromise = result.current.handleSave(formData); });
    expect(result.current.items).toEqual([original]);
    expect(result.current.showModal).toBe(true);

    await act(async () => {
      resolveCreate(created);
      await savePromise;
    });
    expect(result.current.items).toEqual([original, created]);
    expect(result.current.showModal).toBe(false);
  });

  it("updates and deletes only after successful service calls", async () => {
    const updated = { ...original, preco10ml: 10 };
    let resolveUpdate!: (value: typeof updated) => void;
    let resolveDelete!: (value: number) => void;
    updateBodySplashMock.mockImplementation(() => new Promise((resolve) => { resolveUpdate = resolve; }));
    removeBodySplashMock.mockImplementation(() => new Promise((resolve) => { resolveDelete = resolve; }));
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setEditItem(original));
    let updatePromise!: Promise<void>;
    act(() => {
      updatePromise = result.current.handleSave({
        ...formData,
        produtoId: "7",
        precos: { ...formData.precos, preco10ml: "10" },
      });
    });
    expect(result.current.items).toEqual([original]);
    await act(async () => {
      resolveUpdate(updated);
      await updatePromise;
    });
    expect(result.current.items).toEqual([updated]);

    act(() => result.current.setDeleteItem(updated));
    let deletePromise!: Promise<void>;
    act(() => { deletePromise = result.current.confirmDelete(); });
    expect(result.current.items).toEqual([updated]);
    expect(result.current.deleteItem).toEqual(updated);
    await act(async () => {
      resolveDelete(1);
      await deletePromise;
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.deleteItem).toBeNull();
  });

  it("keeps state and modal targets intact when mutations fail", async () => {
    createBodySplashMock.mockRejectedValue(new Error("BODY_SPLASH_CREATE_FAILED:500"));
    removeBodySplashMock.mockRejectedValue(new Error("BODY_SPLASH_DELETE_FAILED:500"));
    const { result } = renderHook(() => useBodySplashFacade());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setShowModal(true));
    await act(async () => {
      await expect(result.current.handleSave(formData)).rejects.toThrow();
    });
    expect(result.current.items).toEqual([original]);
    expect(result.current.showModal).toBe(true);

    act(() => result.current.setDeleteItem(original));
    await act(async () => { await result.current.confirmDelete(); });
    expect(result.current.items).toEqual([original]);
    expect(result.current.deleteItem).toEqual(original);
    expect(result.current.error).toBeTruthy();
  });
});