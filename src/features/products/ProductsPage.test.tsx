import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useProductsFacadeMock } = vi.hoisted(() => ({
  useProductsFacadeMock: vi.fn(),
}));

vi.mock("./facade/useProductsFacade", () => ({
  useProductsFacade: useProductsFacadeMock,
}));

import { ProductsPage } from "./ProductsPage";

describe("ProductsPage", () => {
  it("renders the products composition and opens the create flow", () => {
    const openCreateForm = vi.fn();
    const setCurrentPage = vi.fn();

    useProductsFacadeMock.mockReturnValue({
      categoryOptions: [{ id: 1, nome: "Perfumes" }],
      categoryTabs: [{ id: "todos", nome: "Todos" }, { id: "1", nome: "Perfumes" }],
      closeDeleteConfirm: vi.fn(),
      closeForm: vi.fn(),
      confirmDelete: vi.fn(),
      criticalThreshold: 6,
      currentPage: 1,
      deleteTarget: null,
      error: "",
      filteredProductsCount: 23,
      formTarget: null,
      isDeleteSubmitting: false,
      isFormOpen: false,
      isLoading: false,
      isSubmitting: false,
      openCreateForm,
      openDeleteConfirm: vi.fn(),
      openEditForm: vi.fn(),
      paginatedProducts: [{ ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 8, estoqueStatus: "ok", id: 1, margemCalculada: null, marca: "Chanel", nome: "Chance", precoVenda: 180, volumeLabel: "100ml" }],
      products: [],
      search: "",
      selectedCategory: "todos",
      setCurrentPage,
      setSearch: vi.fn(),
      setSelectedCategory: vi.fn(),
      setStatusFilter: vi.fn(),
      sortAscending: true,
      sortField: "nome",
      statusFilter: "todos",
      submitSearch: vi.fn(),
      submitProduct: vi.fn(),
      toggleSort: vi.fn(),
      totalPages: 3,
    });

    render(<ProductsPage />);

    expect(screen.getByRole("heading", { name: "Estoque – Produtos" })).toBeInTheDocument();
    expect(screen.getAllByText("Chance")).not.toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: /Novo produto/i }));
    expect(openCreateForm).toHaveBeenCalled();
    document.getElementById("products-section")!.scrollIntoView = vi.fn();
    expect(screen.getAllByText("Exibindo 1 a 1 de 23 produtos")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Anterior" })[0]).toBeDisabled();
    fireEvent.click(screen.getAllByRole("button", { name: "2", exact: true })[0]);
    expect(setCurrentPage).toHaveBeenCalledWith(2);
  });

  it("shows error, loading and modal states", () => {
    useProductsFacadeMock.mockReturnValue({
      categoryOptions: [{ id: 1, nome: "Perfumes" }],
      categoryTabs: [{ id: "todos", nome: "Todos" }],
      closeDeleteConfirm: vi.fn(),
      closeForm: vi.fn(),
      confirmDelete: vi.fn(),
      criticalThreshold: 6,
      currentPage: 1,
      deleteTarget: { id: 1, nome: "Chance" },
      error: "Não foi possível carregar os produtos.",
      filteredProductsCount: 0,
      formTarget: { ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 8, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 },
      isDeleteSubmitting: false,
      isFormOpen: true,
      isLoading: true,
      isSubmitting: false,
      openCreateForm: vi.fn(),
      openDeleteConfirm: vi.fn(),
      openEditForm: vi.fn(),
      paginatedProducts: [],
      products: [],
      search: "",
      selectedCategory: "todos",
      setCurrentPage: vi.fn(),
      setSearch: vi.fn(),
      setSelectedCategory: vi.fn(),
      setStatusFilter: vi.fn(),
      sortAscending: true,
      sortField: "nome",
      statusFilter: "todos",
      submitSearch: vi.fn(),
      submitProduct: vi.fn().mockResolvedValue(undefined),
      toggleSort: vi.fn(),
      totalPages: 1,
    });

    render(<ProductsPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar os produtos.");
    expect(screen.getByText("Carregando produtos...")).toBeInTheDocument();
    expect(screen.getByText("Editar Produto")).toBeInTheDocument();
    expect(screen.getByText("Remover produto")).toBeInTheDocument();
  });
});