import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DecantModal } from "./DecantModal";
import { DECANT_ALREADY_LINKED } from "../services/decants.service";

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

  it("shows the duplicate-link error without repeated submissions or losing form values", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error(DECANT_ALREADY_LINKED));
    render(<DecantModal perfumeOptions={[{ id: 7, nome: "Sauvage" }]} onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/Perfume vinculado/i), { target: { value: "7" } });
    for (const volume of ["2ml", "3ml", "5ml", "10ml"]) {
      fireEvent.change(screen.getByLabelText(`Preço ${volume}`), { target: { value: "15" } });
    }
    const button = screen.getByRole("button", { name: /Salvar decant/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText(DECANT_ALREADY_LINKED)).toBeInTheDocument());
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/Perfume vinculado/i)).toHaveValue("7");
    expect(screen.getByLabelText("Preço 2ml")).toHaveValue(15);
    expect(button).toBeEnabled();
  });

  it("locks the original perfume when editing even without options and allows price changes", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <DecantModal
        edit={{ id: 11, perfumeId: 8, perfume: "Libre", preco2ml: 13, preco3ml: 18, preco5ml: 26, preco10ml: 47 }}
        perfumeOptions={[]}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    const select = screen.getByLabelText(/Perfume vinculado/i);
    expect(select).toBeDisabled();
    expect(select).toHaveValue("8");
    expect(screen.getByRole("option", { name: "Libre" })).toBeInTheDocument();
    fireEvent.change(select, { target: { value: "7" } });
    expect(select).toHaveValue("8");
    fireEvent.change(screen.getByLabelText("Preço 2ml"), { target: { value: "19" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar decant/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      perfumeId: "8", preco2ml: "19", preco3ml: "18", preco5ml: "26", preco10ml: "47",
    }));
  });
});