import type { ComponentProps, ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

interface MockTableData {
  id: number | string;
}

interface MockTableHeader {
  name: string;
  orderColumn?: boolean;
  value: string;
}

interface MockTableProps {
  data: MockTableData[];
  emptyState?: ReactNode;
  footer?: ReactNode;
  header: MockTableHeader[];
  onOrderColumn?: (value: string) => void;
  renderHeaderLabel?: (header: MockTableHeader) => ReactNode;
  renderRow: (row: MockTableData) => ReactNode;
}

vi.mock("../../../shared/components/peract-table", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../shared/components/peract-table")>();
  const React = await import("react");

  const PeractTableRow = ({ children, ...props }: ComponentProps<"tr">) =>
    React.createElement("tr", { ...props, "data-testid": "peract-table-row" }, children);
  const PeractTableCell = ({ children, ...props }: ComponentProps<"td">) =>
    React.createElement("td", { ...props, "data-testid": "peract-table-cell" }, children);
  const PeractTable = ({ data, emptyState, footer, header, onOrderColumn, renderHeaderLabel, renderRow }: MockTableProps) =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "table",
        null,
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            header.map((column) =>
              React.createElement(
                "th",
                { key: column.value },
                column.orderColumn && onOrderColumn
                  ? React.createElement("button", { onClick: () => onOrderColumn(column.value), type: "button" }, renderHeaderLabel?.(column) ?? column.name)
                  : renderHeaderLabel?.(column) ?? column.name,
              ),
            ),
          ),
        ),
        React.createElement("tbody", null, data.length === 0 ? React.createElement("tr", null, React.createElement("td", { colSpan: header.length }, emptyState)) : data.map(renderRow)),
      ),
      footer,
    );

  return { ...actual, PeractTable, PeractTableCell, PeractTableRow };
});

import { ProductsTable } from "./ProductsTable";

const product = {
  ativo: 1,
  categoriaId: 3,
  categoriaNome: "Perfumes",
  estoqueAtual: 8,
  estoqueStatus: "ok" as const,
  id: 7,
  margemCalculada: 40,
  marca: "Chanel",
  medida: "ML" as const,
  nome: "Chance",
  precoCompra: 100,
  precoVenda: 180,
  volume: 100,
  volumeLabel: "100ml",
};

function renderProductsTable(overrides: Partial<ComponentProps<typeof ProductsTable>> = {}) {
  const props: ComponentProps<typeof ProductsTable> = {
    currentPage: 1,
    onCreateProduct: vi.fn(),
    onDeleteProduct: vi.fn(),
    onEditProduct: vi.fn(),
    onPageChange: vi.fn(),
    onSort: vi.fn(),
    products: [product],
    sortAscending: true,
    sortField: "nome",
    totalPages: 2,
    totalProducts: 12,
    ...overrides,
  };

  return { props, ...render(<ProductsTable {...props} />) };
}

describe("ProductsTable", () => {
  it("renders each desktop row and cell through Peract table primitives", () => {
    renderProductsTable();

    const rows = screen.getAllByTestId("peract-table-row");
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getAllByTestId("peract-table-cell")).toHaveLength(10);
  });

  it("preserves sorting, actions and pagination", () => {
    const { props } = renderProductsTable();

    fireEvent.click(screen.getByRole("button", { name: /Produto/i }));
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Excluir" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "2", exact: true })[0]);

    expect(props.onSort).toHaveBeenCalledWith("nome");
    expect(props.onEditProduct).toHaveBeenCalledWith(product);
    expect(props.onDeleteProduct).toHaveBeenCalledWith({ id: 7, nome: "Chance", categoriaNome: "Perfumes" });
    expect(props.onPageChange).toHaveBeenCalledWith(2);
  });

  it("preserves the empty state creation action", () => {
    const onCreateProduct = vi.fn();
    renderProductsTable({ onCreateProduct, products: [], totalProducts: 0 });

    expect(screen.getAllByText("Nenhum produto encontrado.")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Criar primeiro produto" }));
    expect(onCreateProduct).toHaveBeenCalledOnce();
  });
});