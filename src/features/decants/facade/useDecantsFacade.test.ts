import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDecantsFacade } from "./useDecantsFacade";

describe("useDecantsFacade", () => {
  it("filters without changing the source collection", () => {
    const { result } = renderHook(() => useDecantsFacade());
    const originalCount = result.current.decants.length;
    act(() => result.current.setSearch("chanel"));
    expect(result.current.filtered.map((decant) => decant.perfume)).toEqual(["Chanel N°5"]);
    act(() => result.current.setSearch("inexistente"));
    expect(result.current.filtered).toEqual([]);
    expect(result.current.decants).toHaveLength(originalCount);
  });

  it("creates and edits a decant without mutating other entries", () => {
    const { result } = renderHook(() => useDecantsFacade());
    const original = result.current.decants;
    const data = { perfume: "Novo perfume", preco2ml: 10, preco3ml: 15, preco5ml: 20, preco10ml: 30 };
    act(() => result.current.setShowModal(true));
    act(() => result.current.handleSave(data));
    expect(result.current.decants).toHaveLength(original.length + 1);
    expect(result.current.showModal).toBe(false);
    const created = result.current.decants.at(-1)!;
    expect(original.some((decant) => decant.id === created.id)).toBe(false);
    act(() => result.current.setEditDecant(created));
    act(() => result.current.handleSave({ ...data, preco2ml: 25 }));
    expect(result.current.decants.at(-1)).toEqual({ ...created, preco2ml: 25 });
    expect(result.current.decants.slice(0, -1)).toEqual(original);
    expect(result.current.editDecant).toBeNull();
  });
});