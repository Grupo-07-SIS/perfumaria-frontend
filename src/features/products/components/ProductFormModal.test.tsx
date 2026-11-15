import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductFormModal } from "./ProductFormModal";

describe("ProductFormModal", () => {
  it("shows save errors inside the dialog and supports retry", async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error("PRODUCTS_SUBMIT_FAILED")).mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<ProductFormModal categories={[{ id: 1, nome: "Perfumes" }]} defaultValues={{ categoriaId: "1", estoqueAtual: "4", hasVolume: false, marca: "Chanel", medida: "ML", nome: "Chance", precoCompra: "100", precoVenda: "180", volume: "" }} onClose={onClose} onSave={onSave} submitting={false} title="Editar Produto" />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar o produto.");
    expect(screen.getByRole("dialog")).toContainElement(screen.getByRole("alert"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("validates and submits the product form", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ProductFormModal
        categories={[{ id: 1, nome: "Perfumes" }]}
        onClose={vi.fn()}
        onSave={onSave}
        submitting={false}
        title="Novo Produto"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Nome do produto/i), { target: { value: "Sauvage" } });
    fireEvent.change(screen.getByLabelText(/Estoque atual/i), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText(/Preço de venda/i), { target: { value: "150" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        categoriaId: "1",
        estoqueAtual: "8",
        hasVolume: false,
        marca: "",
        medida: "ML",
        nome: "Sauvage",
        precoCompra: "",
        precoVenda: "150",
        volume: "",
      });
    });
  });

  it("renders edit defaults and saving state", () => {
    render(
      <ProductFormModal
        categories={[{ id: 1, nome: "Perfumes" }]}
        defaultValues={{ categoriaId: "1", estoqueAtual: "4", hasVolume: true, marca: "Chanel", medida: "ML", nome: "Chance", precoCompra: "100", precoVenda: "180", volume: "100" }}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        submitting
        title="Editar Produto"
      />,
    );

    expect(screen.getByDisplayValue("Chance")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeInTheDocument();
    expect(screen.getByText(/Margem de lucro estimada/i)).toBeInTheDocument();
  });
});