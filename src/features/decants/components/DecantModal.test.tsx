import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DecantModal } from "./DecantModal";

describe("DecantModal", () => {
  it("renders backend perfume options and submits the selected perfume id", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <DecantModal
        perfumeOptions={[{ id: 7, nome: "Chanel N°5" }, { id: 8, nome: "Libre" }]}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Perfume vinculado/i), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Preço 2ml"), { target: { value: "13" } });
    fireEvent.change(screen.getByLabelText("Preço 3ml"), { target: { value: "18" } });
    fireEvent.change(screen.getByLabelText("Preço 5ml"), { target: { value: "26" } });
    fireEvent.change(screen.getByLabelText("Preço 10ml"), { target: { value: "47" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar decant/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      perfumeId: "8",
      preco2ml: "13",
      preco3ml: "18",
      preco5ml: "26",
      preco10ml: "47",
    }));
  });

  it("selects the perfume id when editing", () => {
    render(
      <DecantModal
        edit={{ id: 11, perfumeId: 8, perfume: "Libre", preco2ml: 13, preco3ml: 18, preco5ml: 26, preco10ml: 47 }}
        perfumeOptions={[{ id: 8, nome: "Libre" }]}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByLabelText(/Perfume vinculado/i)).toHaveValue("8");
  });
});