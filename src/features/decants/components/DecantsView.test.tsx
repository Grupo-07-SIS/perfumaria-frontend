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
    firstItem: 11,
    lastItem: 11,
    canManagePrices: true,
    ...overrides,
  } as unknown as ComponentProps<typeof DecantsView>;

  return { setCurrentPage, ...render(<DecantsView {...props} />) };
}

describe("DecantsView", () => {
  it("renders and delegates page changes to PeractPagination", () => {
    const { setCurrentPage } = renderDecantsView();

    expect(screen.getAllByText("Exibindo 11 a 11 de 23 decant(s)")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "3", exact: true })[0]);

    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });

  it("hides create, edit and delete controls for employees", () => {
    renderDecantsView({ canManagePrices: false });

    expect(screen.queryByRole("button", { name: "Cadastrar Decant" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
  });
});