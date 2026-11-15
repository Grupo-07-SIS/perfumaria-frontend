import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useCategoriesFacadeMock } = vi.hoisted(() => ({
  useCategoriesFacadeMock: vi.fn(),
}));

vi.mock("./facade/useCategoriesFacade", () => ({
  useCategoriesFacade: useCategoriesFacadeMock,
}));

import { CategoriesPage } from "./CategoriesPage";

describe("CategoriesPage", () => {
  it("renders the categories page composition and calls creation action", () => {
    const openCreateForm = vi.fn();

    useCategoriesFacadeMock.mockReturnValue({
      categories: [{ id: 1, linkedProducts: 4, nome: "Perfumes" }],
      closeDeleteConfirm: vi.fn(),
      closeForm: vi.fn(),
      confirmDelete: vi.fn(),
      currentPage: 1,
      deleteTarget: null,
      error: "",
      formTarget: null,
      isDeleteSubmitting: false,
      isFormOpen: false,
      isLoading: false,
      isSubmitting: false,
      openCreateForm,
      openDeleteConfirm: vi.fn(),
      openEditForm: vi.fn(),
      paginatedCategories: [{ id: 1, linkedProducts: 4, nome: "Perfumes" }],
      setCurrentPage: vi.fn(),
      submitCategory: vi.fn(),
      totalPages: 1,
    });

    render(<CategoriesPage />);

    expect(screen.getByRole("heading", { name: "Categorias" })).toBeInTheDocument();
    expect(screen.getAllByText("Perfumes")).not.toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: /Nova Categoria/i }));

    expect(openCreateForm).toHaveBeenCalled();
  });

  it("shows error, loading and modal states", () => {
    const facade = {
      categories: [],
      closeDeleteConfirm: vi.fn(),
      closeForm: vi.fn(),
      confirmDelete: vi.fn(),
      currentPage: 1,
      deleteTarget: null,
      error: "Não foi possível carregar as categorias.",
      formTarget: { id: 1, nome: "Perfumes" },
      isDeleteSubmitting: false,
      isFormOpen: false,
      isLoading: true,
      isSubmitting: false,
      openCreateForm: vi.fn(),
      openDeleteConfirm: vi.fn(),
      openEditForm: vi.fn(),
      paginatedCategories: [],
      setCurrentPage: vi.fn(),
      submitCategory: vi.fn().mockResolvedValue(undefined),
      totalPages: 1,
    };
    useCategoriesFacadeMock.mockReturnValue(facade);

    const { rerender } = render(<CategoriesPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar as categorias.");
    expect(screen.getByText("Carregando categorias...")).toBeInTheDocument();
    useCategoriesFacadeMock.mockReturnValue({ ...facade, isFormOpen: true });
    rerender(<CategoriesPage />);
    expect(screen.getByRole("dialog", { name: "Editar Categoria" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    useCategoriesFacadeMock.mockReturnValue({ ...facade, deleteTarget: { id: 1, linkedProducts: 2, nome: "Perfumes" } });
    rerender(<CategoriesPage />);
    expect(screen.getByText("Excluir categoria")).toBeInTheDocument();
  });
});