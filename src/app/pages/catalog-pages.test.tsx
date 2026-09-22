import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Decants } from "./Decants";
import { BodySplash } from "./BodySplash";

describe("Catalog workflows", () => {
  it("filters decants and reports an empty result", async () => {
    const user = userEvent.setup();
    render(<Decants />);
    await user.type(screen.getByPlaceholderText("Buscar por perfume..."), "inexistente");
    expect(screen.queryByRole("cell", { name: "Chanel N°5" })).not.toBeInTheDocument();
    expect(screen.getAllByText(/Nenhum decant/i).length).toBeGreaterThan(0);
  });

  it("validates creation before saving a decant", async () => {
    const user = userEvent.setup();
    render(<Decants />);
    await user.click(screen.getByRole("button", { name: /cadastrar decant/i }));
    await user.click(screen.getByRole("button", { name: /salvar decant/i }));
    expect(screen.getByText("Selecione um perfume.")).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox"), "Chanel N°5");
    for (const field of screen.getAllByRole("spinbutton")) await user.type(field, "10");
    await user.click(screen.getByRole("button", { name: /salvar decant/i }));
    expect(screen.queryByRole("button", { name: /salvar decant/i })).not.toBeInTheDocument();
  });

  it("cancels deletion without removing the row", async () => {
    const user = userEvent.setup();
    render(<Decants />);
    const table = screen.getByRole("table");
    const row = within(table).getByText("Chanel N°5").closest("tr")!;
    await user.click(within(row).getByTitle("Excluir"));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(within(table).getByText("Chanel N°5")).toBeInTheDocument();
  });

  it("filters body splash without changing the catalog", async () => {
    const user = userEvent.setup();
    render(<BodySplash />);
    const search = screen.getByPlaceholderText("Buscar por nome do body splash...");
    await user.type(search, "inexistente");
    expect(screen.getAllByText(/Nenhum body splash/i).length).toBeGreaterThan(0);
    await user.clear(search);
    expect(screen.getByRole("table").querySelectorAll("tbody tr").length).toBeGreaterThan(1);
  });
});