import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createDecantMock,
  fetchBodySplashCatalogMock,
  fetchDecantsMock,
  fetchPerfumeOptionsMock,
  removeBodySplashMock,
  removeDecantMock,
  updateBodySplashMock,
  updateDecantMock,
} = vi.hoisted(() => ({
  createDecantMock: vi.fn(),
  fetchBodySplashCatalogMock: vi.fn(),
  fetchDecantsMock: vi.fn(),
  fetchPerfumeOptionsMock: vi.fn(),
  removeBodySplashMock: vi.fn(),
  removeDecantMock: vi.fn(),
  updateBodySplashMock: vi.fn(),
  updateDecantMock: vi.fn(),
}));

vi.mock("../../features/decants/services/decants.service", async importOriginal => ({
  ...await importOriginal<typeof import("../../features/decants/services/decants.service")>(),
  createDecant: createDecantMock,
  fetchDecants: fetchDecantsMock,
  fetchPerfumeOptions: fetchPerfumeOptionsMock,
  removeDecant: removeDecantMock,
  updateDecant: updateDecantMock,
}));

vi.mock("../../features/body-splash/services/body-splash.service", async importOriginal => ({
  ...await importOriginal<typeof import("../../features/body-splash/services/body-splash.service")>(),
  fetchBodySplashCatalog: fetchBodySplashCatalogMock,
  removeBodySplash: removeBodySplashMock,
  updateBodySplash: updateBodySplashMock,
}));

import { Decants } from "./Decants";
import { BodySplash } from "./BodySplash";

const chanelDecant = {
  id: 1,
  perfumeId: 7,
  perfume: "Chanel N°5",
  preco2ml: 12,
  preco3ml: 17,
  preco5ml: 25,
  preco10ml: 45,
};

const bodySplashItems = [{
  id: 1,
  produtoId: 1,
  produto: "Lavanda & Ylang",
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
}, {
  id: 2,
  produtoId: 2,
  produto: "Rosa & Baunilha",
  preco10ml: 9,
  preco15ml: 12,
  preco20ml: 15,
  preco25ml: 18,
  preco30ml: 21,
}];

describe("Catalog workflows", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchDecantsMock.mockImplementation(async ({ busca = "" }: { busca?: string } = {}) => {
      const content = [chanelDecant].filter(decant => decant.perfume.toLowerCase().includes(busca.toLowerCase()));
      return { content, number: 0, totalElements: content.length, totalPages: 1 };
    });
    fetchPerfumeOptionsMock.mockResolvedValue([{ id: 7, nome: "Chanel N°5" }]);
    createDecantMock.mockResolvedValue({ ...chanelDecant, id: 2, preco2ml: 10, preco3ml: 10, preco5ml: 10, preco10ml: 10 });
    fetchBodySplashCatalogMock.mockImplementation(async ({ busca = "" }: { busca?: string } = {}) => {
      const content = bodySplashItems.filter(item => item.produto.toLowerCase().includes(busca.toLowerCase()));
      return {
        page: { content, number: 0, totalElements: content.length, totalPages: 1 },
        productOptions: bodySplashItems.map(item => ({ id: item.produtoId, nome: item.produto })),
      };
    });
  });

  it("filters decants and reports an empty result", async () => {
    const user = userEvent.setup();
    render(<Decants />);
    await screen.findByRole("cell", { name: "Chanel N°5" });
    await user.type(screen.getByPlaceholderText("Buscar por perfume..."), "inexistente");
    await waitFor(() => expect(screen.queryByRole("cell", { name: "Chanel N°5" })).not.toBeInTheDocument());
    expect(screen.getAllByText(/Nenhum decant/i).length).toBeGreaterThan(0);
  });

  it("validates creation before saving a decant", async () => {
    const user = userEvent.setup();
    render(<Decants />);
    await screen.findByRole("cell", { name: "Chanel N°5" });
    await user.click(screen.getByRole("button", { name: /cadastrar decant/i }));
    await user.click(screen.getByRole("button", { name: /salvar decant/i }));
    expect(screen.getByText("Selecione um perfume.")).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox"), "7");
    for (const field of screen.getAllByRole("spinbutton")) await user.type(field, "10");
    await user.click(screen.getByRole("button", { name: /salvar decant/i }));
    expect(screen.queryByRole("button", { name: /salvar decant/i })).not.toBeInTheDocument();
  });

  it("cancels deletion without removing the row", async () => {
    const user = userEvent.setup();
    render(<Decants />);
    await screen.findByRole("cell", { name: "Chanel N°5" });
    const table = screen.getByRole("table");
    const row = within(table).getByText("Chanel N°5").closest("tr")!;
    await user.click(within(row).getByTitle("Excluir"));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(within(table).getByText("Chanel N°5")).toBeInTheDocument();
  });

  it("filters body splash without changing the catalog", async () => {
    const user = userEvent.setup();
    render(<BodySplash />);
    await screen.findByRole("cell", { name: "Lavanda & Ylang" });
    const search = screen.getByPlaceholderText("Buscar por nome do body splash...");
    await user.type(search, "inexistente");
    expect((await screen.findAllByText(/Nenhum body splash/i)).length).toBeGreaterThan(0);
    await user.clear(search);
    await waitFor(() => expect(screen.getByRole("table").querySelectorAll("tbody tr").length).toBeGreaterThan(1));
  });
});