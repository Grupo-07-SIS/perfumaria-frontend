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

import { CategoriesTable } from "./CategoriesTable";

const category = { id: 4, linkedProducts: 3, nome: "Perfumes" };

function renderCategoriesTable(overrides: Partial<ComponentProps<typeof CategoriesTable>> = {}) {
  const props: ComponentProps<typeof CategoriesTable> = {
    categories: [category],
    currentPage: 1,
    onCreateCategory: vi.fn(),
    onDeleteCategory: vi.fn(),
    onEditCategory: vi.fn(),
    onPageChange: vi.fn(),
    totalCategories: 12,
    totalPages: 2,
    ...overrides,
  };

  return { props, ...render(<CategoriesTable {...props} />) };
}

describe("CategoriesTable", () => {
  it("renders each row and cell through Peract table primitives", () => {
    renderCategoriesTable();

    const rows = screen.getAllByTestId("peract-table-row");
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getAllByTestId("peract-table-cell")).toHaveLength(4);
  });

  it("preserves actions and pagination", () => {
    const { props } = renderCategoriesTable();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "2", exact: true }));

    expect(props.onEditCategory).toHaveBeenCalledWith({ id: 4, nome: "Perfumes" });
    expect(props.onDeleteCategory).toHaveBeenCalledWith({ id: 4, linkedProducts: 3, nome: "Perfumes" });
    expect(props.onPageChange).toHaveBeenCalledWith(2);
  });

  it("preserves the empty state creation action", () => {
    const onCreateCategory = vi.fn();
    renderCategoriesTable({ categories: [], onCreateCategory, totalCategories: 0 });

    expect(screen.getByText("Nenhuma categoria cadastrada.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Criar primeira categoria" }));
    expect(onCreateCategory).toHaveBeenCalledOnce();
  });
});