import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BodySplashPage } from "./BodySplashPage";

function productRow(name: string) {
  return within(screen.getByRole("table")).getByRole("row", { name: new RegExp(name) });
}

describe("BodySplash: caracterizacao do catalogo", () => {
  it("busca sem diferenciar maiusculas e recupera os produtos apos resultado vazio", async () => {
    const user = userEvent.setup();
    render(<BodySplashPage />);
    const search = screen.getByPlaceholderText("Buscar por nome do body splash...");
    await user.type(search, "LAVANDA");
    expect(productRow("Lavanda & Ylang")).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Rosa & Baunilha" })).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "inexistente");
    expect(within(screen.getByRole("table")).getByText("Nenhum body splash cadastrado.")).toBeInTheDocument();
    await user.clear(search);
    expect(productRow("Lavanda & Ylang")).toBeInTheDocument();
    expect(productRow("Rosa & Baunilha")).toBeInTheDocument();
    expect(productRow("Flor de Laranjeira")).toBeInTheDocument();
  });

  it("exige produto e cinco precos positivos antes de cadastrar com valores por volume", async () => {
    const user = userEvent.setup();
    render(<BodySplashPage />);
    await user.click(screen.getByRole("button", { name: "Cadastrar Body Splash" }));
    const dialog = within(screen.getByRole("dialog", { name: "Cadastrar Body Splash" }));
    const save = dialog.getByRole("button", { name: "Cadastrar Body Splash" });
    await user.click(save);
    expect(dialog.getByText("Selecione um Body Splash.")).toBeInTheDocument();
    await user.selectOptions(dialog.getByRole("combobox"), "Coco & Baunilha");
    await user.click(save);
    expect(dialog.getByText("Preencha todos os preços.")).toBeInTheDocument();
    for (const [volume, price] of [["10ml", "7.5"], ["15ml", "10"], ["20ml", "12.5"], ["25ml", "15"], ["30ml", "17.5"]]) {
      fireEvent.change(dialog.getByLabelText(`Frasco ${volume}`), { target: { value: price } });
    }
    for (const invalid of ["0", "-1"]) {
      fireEvent.change(dialog.getByLabelText("Frasco 30ml"), { target: { value: invalid } });
      await user.click(save);
      expect(dialog.getByText("Preencha todos os preços.")).toBeInTheDocument();
    }
    fireEvent.change(dialog.getByLabelText("Frasco 30ml"), { target: { value: "17.5" } });
    await user.click(save);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(productRow("Coco & Baunilha")).getAllByRole("cell").slice(0, 6).map(cell => cell.textContent)).toEqual([
      "Coco & Baunilha", "R$ 7,50", "R$ 10,00", "R$ 12,50", "R$ 15,00", "R$ 17,50",
    ]);
  });

  it("descarta uma edicao cancelada e salva apenas o preco alterado sem duplicar produto", async () => {
    const user = userEvent.setup();
    render(<BodySplashPage />);
    await user.click(within(productRow("Lavanda & Ylang")).getByRole("button", { name: "Editar" }));
    let dialog = within(screen.getByRole("dialog", { name: "Editar Body Splash" }));
    expect(dialog.getByRole("combobox")).toHaveValue("Lavanda & Ylang");
    expect(dialog.getByLabelText("Frasco 10ml")).toHaveValue(8);
    fireEvent.change(dialog.getByLabelText("Frasco 10ml"), { target: { value: "9.5" } });
    await user.click(dialog.getByRole("button", { name: "Cancelar" }));
    expect(within(productRow("Lavanda & Ylang")).getByRole("cell", { name: "R$ 8,00" })).toBeInTheDocument();
    await user.click(within(productRow("Lavanda & Ylang")).getByRole("button", { name: "Editar" }));
    dialog = within(screen.getByRole("dialog", { name: "Editar Body Splash" }));
    fireEvent.change(dialog.getByLabelText("Frasco 10ml"), { target: { value: "9.5" } });
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    expect(within(productRow("Lavanda & Ylang")).getByRole("cell", { name: "R$ 9,50" })).toBeInTheDocument();
    expect(within(productRow("Lavanda & Ylang")).getByRole("cell", { name: "R$ 20,00" })).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(4);
    expect(within(productRow("Rosa & Baunilha")).getByRole("cell", { name: "R$ 8,00" })).toBeInTheDocument();
  });

  it("exige confirmacao para excluir e mantem os demais produtos", async () => {
    const user = userEvent.setup();
    render(<BodySplashPage />);
    await user.click(within(productRow("Rosa & Baunilha")).getByRole("button", { name: "Excluir" }));
    await user.click(within(screen.getByRole("dialog", { name: "Excluir Body Splash" })).getByRole("button", { name: "Cancelar" }));
    expect(productRow("Rosa & Baunilha")).toBeInTheDocument();
    await user.click(within(productRow("Rosa & Baunilha")).getByRole("button", { name: "Excluir" }));
    await user.click(within(screen.getByRole("dialog", { name: "Excluir Body Splash" })).getByRole("button", { name: "Excluir", exact: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Rosa & Baunilha" })).not.toBeInTheDocument();
    expect(productRow("Lavanda & Ylang")).toBeInTheDocument();
    expect(productRow("Flor de Laranjeira")).toBeInTheDocument();
  });
});