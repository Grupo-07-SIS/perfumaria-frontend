import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createBodySplashMock,
  fetchBodySplashCatalogMock,
  removeBodySplashMock,
  useAppMock,
  updateBodySplashMock,
} = vi.hoisted(() => ({
  createBodySplashMock: vi.fn(),
  fetchBodySplashCatalogMock: vi.fn(),
  removeBodySplashMock: vi.fn(),
  useAppMock: vi.fn(),
  updateBodySplashMock: vi.fn(),
}));

vi.mock("../../core/store/AppContext", () => ({ useApp: useAppMock }));

vi.mock("./services/body-splash.service", async importOriginal => ({
  ...await importOriginal<typeof import("./services/body-splash.service")>(),
  createBodySplash: createBodySplashMock,
  fetchBodySplashCatalog: fetchBodySplashCatalogMock,
  removeBodySplash: removeBodySplashMock,
  updateBodySplash: updateBodySplashMock,
}));

import { BodySplashPage } from "./BodySplashPage";
import type { BodySplashItem, BodySplashModalFormValues } from "./models/body-splash.models";

const initialItems: BodySplashItem[] = [{
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
  preco10ml: 8,
  preco15ml: 11,
  preco20ml: 14,
  preco25ml: 17,
  preco30ml: 20,
}, {
  id: 3,
  produtoId: 3,
  produto: "Flor de Laranjeira",
  preco10ml: 9,
  preco15ml: 12,
  preco20ml: 15,
  preco25ml: 18,
  preco30ml: 22,
}];

const productOptions = [
  { id: 1, nome: "Lavanda & Ylang" },
  { id: 2, nome: "Rosa & Baunilha" },
  { id: 3, nome: "Flor de Laranjeira" },
  { id: 4, nome: "Coco & Baunilha" },
];

function itemFromForm(id: number, values: BodySplashModalFormValues): BodySplashItem {
  const produtoId = Number(values.produtoId);
  return {
    id,
    produtoId,
    produto: productOptions.find(option => option.id === produtoId)?.nome ?? "",
    preco10ml: Number(values.precos.preco10ml),
    preco15ml: Number(values.precos.preco15ml),
    preco20ml: Number(values.precos.preco20ml),
    preco25ml: Number(values.precos.preco25ml),
    preco30ml: Number(values.precos.preco30ml),
  };
}

async function renderLoadedPage() {
  render(<BodySplashPage />);
  await screen.findByRole("cell", { name: "Lavanda & Ylang" });
}

function productRow(name: string) {
  return within(screen.getByRole("table")).getByRole("row", { name: new RegExp(name) });
}

describe("BodySplash: caracterizacao do catalogo", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useAppMock.mockReturnValue({ currentUser: { cargo: "Administrador" } });
    fetchBodySplashCatalogMock.mockResolvedValue({
      page: {
        content: initialItems.map(item => ({ ...item })),
        number: 0,
        totalElements: initialItems.length,
        totalPages: 1,
      },
      productOptions,
    });
    createBodySplashMock.mockImplementation(async (values: BodySplashModalFormValues) => itemFromForm(4, values));
    updateBodySplashMock.mockImplementation(async (item: BodySplashItem, values: BodySplashModalFormValues) => itemFromForm(item.id, values));
    removeBodySplashMock.mockImplementation(async (item: BodySplashItem) => item.id);
  });

  it("busca sem diferenciar maiusculas e recupera os produtos apos resultado vazio", async () => {
    fetchBodySplashCatalogMock.mockImplementation(async ({ busca = "" }: { busca?: string } = {}) => {
      const content = initialItems.filter(item => item.produto.toLowerCase().includes(busca.toLowerCase()));
      return { page: { content, number: 0, totalElements: content.length, totalPages: 1 }, productOptions };
    });
    const user = userEvent.setup();
    await renderLoadedPage();
    const search = screen.getByPlaceholderText("Buscar por nome do body splash...");
    await user.type(search, "LAVANDA");
    await waitFor(() => expect(screen.queryByRole("cell", { name: "Rosa & Baunilha" })).not.toBeInTheDocument());
    expect(productRow("Lavanda & Ylang")).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "inexistente");
    expect(await within(screen.getByRole("table")).findByText("Nenhum body splash cadastrado.")).toBeInTheDocument();
    await user.clear(search);
    await waitFor(() => expect(productRow("Flor de Laranjeira")).toBeInTheDocument());
    expect(productRow("Lavanda & Ylang")).toBeInTheDocument();
    expect(productRow("Rosa & Baunilha")).toBeInTheDocument();
  });

  it("exige produto e cinco precos positivos antes de cadastrar com valores por volume", async () => {
    const user = userEvent.setup();
    await renderLoadedPage();
    await user.click(screen.getByRole("button", { name: "Cadastrar Body Splash" }));
    const dialog = within(screen.getByRole("dialog", { name: "Cadastrar Body Splash" }));
    const save = dialog.getByRole("button", { name: "Cadastrar Body Splash" });
    await user.click(save);
    expect(dialog.getByText("Selecione um Body Splash.")).toBeInTheDocument();
    await user.selectOptions(dialog.getByRole("combobox"), "4");
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

  it("hides price creation and maintenance controls for employees", async () => {
    useAppMock.mockReturnValue({ currentUser: { cargo: "Funcionário" } });
    await renderLoadedPage();

    expect(screen.queryByRole("button", { name: "Cadastrar Body Splash" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
  });

  it("descarta uma edicao cancelada e salva apenas o preco alterado sem duplicar produto", async () => {
    const user = userEvent.setup();
    await renderLoadedPage();
    await user.click(within(productRow("Lavanda & Ylang")).getByRole("button", { name: "Editar" }));
    let dialog = within(screen.getByRole("dialog", { name: "Editar Body Splash" }));
    expect(dialog.getByRole("combobox")).toHaveValue("1");
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
    await renderLoadedPage();
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