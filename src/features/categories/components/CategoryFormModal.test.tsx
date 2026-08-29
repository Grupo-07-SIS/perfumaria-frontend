import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryFormModal } from "./CategoryFormModal";

describe("CategoryFormModal", () => {
  it("validates and submits the category name", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CategoryFormModal
        onClose={onClose}
        onSave={onSave}
        submitting={false}
        title="Nova Categoria"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Kits" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ nome: "Kits" });
    });
  });

  it("renders edit defaults and loading label", () => {
    render(
      <CategoryFormModal
        defaultValues={{ nome: "Perfumes" }}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        submitting
        title="Editar Categoria"
      />,
    );

    expect(screen.getByDisplayValue("Perfumes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeInTheDocument();
  });
});