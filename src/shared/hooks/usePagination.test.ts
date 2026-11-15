import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  it("pagina todos os registros sem limitar a 100", () => {
    const items = Array.from({ length: 105 }, (_, index) => index + 1);
    const { result } = renderHook(() => usePagination(items));
    expect(result.current).toMatchObject({ currentPage: 1, totalPages: 11, firstItem: 1, lastItem: 10, totalItems: 105 });
    expect(result.current.paginatedItems).toEqual(items.slice(0, 10));
    act(() => result.current.setCurrentPage(11));
    expect(result.current).toMatchObject({ firstItem: 101, lastItem: 105 });
    expect(result.current.paginatedItems).toEqual([101, 102, 103, 104, 105]);
  });

  it("ajusta a pagina ao remover os ultimos registros e trata lista vazia", () => {
    const { result, rerender } = renderHook(({ items }) => usePagination(items), { initialProps: { items: Array.from({ length: 11 }, (_, index) => index) } });
    act(() => result.current.setCurrentPage(2));
    rerender({ items: [0, 1] });
    expect(result.current).toMatchObject({ currentPage: 1, firstItem: 1, lastItem: 2 });
    rerender({ items: [] });
    expect(result.current).toMatchObject({ currentPage: 1, totalPages: 1, firstItem: 0, lastItem: 0, paginatedItems: [] });
  });

  it("ignora paginas invalidas e permite voltar ao inicio", () => {
    const { result } = renderHook(() => usePagination(Array.from({ length: 25 }, (_, index) => index)));
    act(() => result.current.setCurrentPage(99));
    expect(result.current.currentPage).toBe(3);
    act(() => result.current.setCurrentPage(Number.NaN));
    expect(result.current.currentPage).toBe(3);
    act(() => result.current.setCurrentPage(1));
    expect(result.current.currentPage).toBe(1);
  });
});