import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BodySplashModal } from "./BodySplashModal";

const productOptions = [
  { id: 7, nome: "Lavanda & Ylang" },
  { id: 8, nome: "Rosa & Baunilha" },
];

describe("BodySplashModal", () => {
  it("renders backend product options and submits the selected product id", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <BodySplashModal
        productOptions={productOptions}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: /Body Splash vinculado/i }), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText("Frasco 10ml"), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText("Frasco 15ml"), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText("Frasco 20ml"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("Frasco 25ml"), { target: { value: "18" } });
    fireEvent.change(screen.getByLabelText("Frasco 30ml"), { target: { value: "21" } });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar Body Splash/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      produtoId: "8",
      precos: {
        preco10ml: "9",
        preco15ml: "12",
        preco20ml: "15",
        preco25ml: "18",
        preco30ml: "21",
      },
    }));
  });

  it("selects the resolved product id when editing", () => {
    render(
      <BodySplashModal
        edit={{
          id: 11,
          produtoId: 8,
          produto: "Rosa & Baunilha",
          preco10ml: 9,
          preco15ml: 12,
          preco20ml: 15,
          preco25ml: 18,
          preco30ml: 21,
        }}
        productOptions={productOptions}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByRole("combobox", { name: /Body Splash vinculado/i })).toHaveValue("8");
  });

  it("keeps an unresolved legacy name visible but blocks an invalid submit", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <BodySplashModal
        edit={{
          id: 11,
          produto: "Produto legado",
          preco10ml: 9,
          preco15ml: 12,
          preco20ml: 15,
          preco25ml: 18,
          preco30ml: 21,
        }}
        productOptions={productOptions}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    expect(screen.getByText("Produto legado")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Body Splash vinculado/i })).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: /Salvar alterações/i }));

    await waitFor(() => expect(screen.getByText("Selecione um Body Splash.")).toBeInTheDocument());
    expect(onSave).not.toHaveBeenCalled();
  });
});