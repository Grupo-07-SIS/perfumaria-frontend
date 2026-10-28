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

    expect(screen.getByRole("heading", { name: "Estoque – Perfumes" })).toBeInTheDocument();
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
    const facade = {
      categoryOptions: [{ id: 1, nome: "Perfumes" }],
      categoryTabs: [{ id: "todos", nome: "Todos" }],
      closeDeleteConfirm: vi.fn(),
      closeForm: vi.fn(),
      confirmDelete: vi.fn(),
      criticalThreshold: 6,
      currentPage: 1,
      deleteTarget: null,
      error: "Não foi possível carregar os produtos.",
      filteredProductsCount: 0,
      formTarget: { ativo: 1, categoriaId: 1, categoriaNome: "Perfumes", estoqueAtual: 8, id: 1, marca: "Chanel", nome: "Chance", precoVenda: 180 },
      isDeleteSubmitting: false,
      isFormOpen: false,
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
    };
    useProductsFacadeMock.mockReturnValue(facade);

    const { rerender } = render(<ProductsPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar os produtos.");
    expect(screen.getByText("Carregando produtos...")).toBeInTheDocument();
    useProductsFacadeMock.mockReturnValue({ ...facade, isFormOpen: true });
    rerender(<ProductsPage />);
    expect(screen.getByRole("dialog", { name: "Editar Produto" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    useProductsFacadeMock.mockReturnValue({ ...facade, deleteTarget: { id: 1, nome: "Chance", categoriaNome: "Perfumes" } });
    rerender(<ProductsPage />);
    expect(screen.getByText("Remover produto")).toBeInTheDocument();
    expect(screen.getByText(/tabela de preços desses decantes/i)).toBeInTheDocument();
    useProductsFacadeMock.mockReturnValue({ ...facade, deleteTarget: { id: 2, nome: "Lavanda", categoriaNome: "Body Splash" } });
    rerender(<ProductsPage />);
    expect(screen.getByText(/tabela de preços desses frascos/i)).toBeInTheDocument();
    useProductsFacadeMock.mockReturnValue({ ...facade, deleteTarget: { id: 3, nome: "Hidratante", categoriaNome: "Hidratantes" } });
    rerender(<ProductsPage />);
    expect(screen.queryByText(/tabela de preços/i)).not.toBeInTheDocument();
  });
});