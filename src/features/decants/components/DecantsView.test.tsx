import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DecantsView } from "./DecantsView";

const decant = {
  id: 1,
  perfumeId: 7,
  perfume: "Chanel N°5",
  preco2ml: 12,
  preco3ml: 17,
  preco5ml: 25,
  preco10ml: 45,
};

function renderDecantsView(overrides: Record<string, unknown> = {}) {
  const setCurrentPage = vi.fn();
  const props = {
    confirmDelete: vi.fn(),
    currentPage: 2,
    decants: [decant],
    deleteDecant: null,
    editDecant: null,
    error: "",
    filtered: [decant],
    fmt: (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`,
    handleSave: vi.fn(),
    isLoading: false,
    perfumeOptions: [],
    search: "",
    setCurrentPage,
    setDeleteDecant: vi.fn(),
    setEditDecant: vi.fn(),
    setSearch: vi.fn(),
    setShowModal: vi.fn(),
    showModal: false,
    totalElements: 23,
    totalPages: 3,
    ...overrides,
  } as unknown as ComponentProps<typeof DecantsView>;

  return { setCurrentPage, ...render(<DecantsView {...props} />) };
}

describe("DecantsView", () => {
  it("renders and delegates page changes to PeractPagination", () => {
    const { setCurrentPage } = renderDecantsView();

    fireEvent.click(screen.getByRole("button", { name: "3", exact: true }));

    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });
});