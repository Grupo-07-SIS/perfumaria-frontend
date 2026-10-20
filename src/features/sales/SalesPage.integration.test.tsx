import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../core/services/http-client";
import { SalesPage } from "./SalesPage";

vi.mock("../../core/services/http-client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));

const product = { id: 42, nome: "Perfume remoto", precoVenda: 45, estoqueAtual: 4, status: 1 };
const customer = { id: 81, nome: "Cliente remoto", email: "cliente@example.test", telefone: "11999998888", status: 1 };

async function renderLoaded() {
  render(<SalesPage />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Registrar venda" })).toBeEnabled());
}

async function addCompleteProduct(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(screen.getByRole("button", { name }));
  await user.click(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true }));
}

async function selectVolume(user: ReturnType<typeof userEvent.setup>, volume: string) {
  act(() => screen.getByLabelText(/Volume/).focus());
  await user.keyboard("{Enter}");
  const option = await screen.findByRole("option", { name: new RegExp(`^${volume}\\s`) });
  act(() => option.focus());
  await user.keyboard("{Enter}");
}

async function reviewAndConfirmSale(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Registrar venda" }));
  await user.click(screen.getByRole("button", { name: "Confirmar registro" }));
}

async function fillSale(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
  await addCompleteProduct(user, /^Perfume remoto/);
  await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Cliente");
  await user.click(screen.getByRole("button", { name: /Cliente remoto/ }));
  await user.selectOptions(screen.getByRole("combobox"), "Pix");
}

describe("Sales backend integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === "/clientes") return { data: { content: [customer], totalPages: 1 } };
      if (url === "/produtos") return { data: { content: [product], totalPages: 1 } };
      if (url === "/vendas/itens-busca") return { data: [{ ...product, status: null, estoqueAtual: null }] };
      throw new Error(`Unexpected endpoint: ${url}`);
    });
    vi.mocked(apiClient.post).mockResolvedValue({ status: 201, data: "" });
  });

  it("loads remote data and validates required fields", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Adicione pelo menos um item");
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione um cliente");
    expect(screen.getByRole("alert")).toHaveTextContent("pagamento");
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("reviews a sale without submitting and preserves the order when returning to edit", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    const modal = within(screen.getByRole("dialog", { name: "Confirmar venda" }));
    expect(modal.getByText("Cliente remoto")).toBeInTheDocument();
    expect(modal.getByText("Perfume remoto")).toBeInTheDocument();
    expect(modal.getByText("Pix")).toBeInTheDocument();
    expect(modal.getByText("Presencial")).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
    await user.click(modal.getByRole("button", { name: "Voltar para alterar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Perfume remoto" })).toHaveValue(1);
    expect(screen.getByRole("combobox")).toHaveValue("Pix");
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    await user.click(screen.getByRole("button", { name: "Confirmar registro" }));
    await screen.findByRole("status");
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });

  it("shows category names next to products with the same name in cart search", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === "/clientes") return { data: { content: [customer], totalPages: 1 } };
      if (url === "/produtos") return { data: { content: [
        { ...product, nome: "Sauvage", categoriaNome: "Perfume" },
        { ...product, id: 43, nome: "Sauvage", categoriaNome: "Body Splash" },
      ], totalPages: 1 } };
      throw new Error(`Unexpected endpoint: ${url}`);
    });
    const user = userEvent.setup();
    await renderLoaded();
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Sauvage");

    const perfume = screen.getByRole("button", { name: /^Sauvage Perfume/ });
    const bodySplash = screen.getByRole("button", { name: /^Sauvage Body Splash/ });
    expect(within(perfume).getByText("Perfume")).toBeInTheDocument();
    expect(within(bodySplash).getByText("Body Splash")).toBeInTheDocument();
    await addCompleteProduct(user, /^Sauvage Body Splash/);
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Sauvage" })).toHaveValue(1);
  });

  it("shows fractionated volume badges and keeps the presentation visible in the cart", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === "/clientes") return { data: { content: [customer], totalPages: 1 } };
      if (url === "/produtos") return { data: { content: [product], totalPages: 1 } };
      if (url === "/vendas/itens-busca") return { data: [
        { id: 1002, nome: "Decant Sauvage 2ml", precoVenda: 49.9, volume: null, estoqueAtual: null, status: null },
        { id: 4010, nome: "Body Splash Sauvage 10ml", precoVenda: 69.9, volume: null, estoqueAtual: null, status: null },
      ] };
      throw new Error(`Unexpected endpoint: ${url}`);
    });
    const user = userEvent.setup();
    await renderLoaded();
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Sauvage");
    const decant = await screen.findByRole("button", { name: /^Sauvage Perfume/ });
    expect(decant).toBeEnabled();
    expect(decant).not.toHaveTextContent("em est.");
    expect(apiClient.get).toHaveBeenCalledWith("/vendas/itens-busca", { params: { nome: "Sauvage" } });
    await user.click(decant);
    expect(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true })).toBeDisabled();
    await selectVolume(user, "2ml");
    expect(screen.getByText("R$ 49.90", { selector: "p" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true }));
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Body Splash");
    const bodySplash = await screen.findByRole("button", { name: /^Sauvage Body Splash/ });
    await user.click(bodySplash);
    await selectVolume(user, "10ml");
    await user.click(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true }));
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Decant Sauvage 2ml" })).toHaveValue(1);
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Body Splash Sauvage 10ml" })).not.toHaveAttribute("max");
    expect(screen.getAllByText("Fracionado")).toHaveLength(2);
    expect(screen.getByText("2ml")).toHaveAttribute("data-slot", "badge");
    expect(screen.getByText("10ml")).toHaveAttribute("data-slot", "badge");
    expect(screen.queryByText("Produto", { exact: true })).not.toBeInTheDocument();
  });

  it("selects presentation and volume, resets volume on mode changes and posts the exact variant IDs", async () => {
    const perfume = { ...product, nome: "Sauvage", categoriaNome: "Perfume" };
    const bodySplash = { ...product, id: 43, nome: "Sauvage", categoriaNome: "Body Splash" };
    const items = [
      perfume,
      bodySplash,
      { id: 1002, nome: "Decant Sauvage 2ml", precoVenda: 49.9, estoqueAtual: null, status: null },
      { id: 1005, nome: "Decant Sauvage 5ml", precoVenda: 89.9, estoqueAtual: null, status: null },
      { id: 4010, nome: "Body Splash Sauvage 10ml", precoVenda: 69.9, estoqueAtual: null, status: null },
    ];
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === "/clientes") return { data: { content: [customer], totalPages: 1 } };
      if (url === "/produtos") return { data: { content: [perfume, bodySplash], totalPages: 1 } };
      if (url === "/vendas/itens-busca") return { data: items };
      throw new Error(`Unexpected endpoint: ${url}`);
    });
    const user = userEvent.setup();
    await renderLoaded();
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Sauvage");
    await user.click(screen.getByRole("button", { name: /^Sauvage Perfume/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Fracionado", exact: true })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Completo", exact: true })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Fracionado", exact: true }));
    expect(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true })).toBeDisabled();
    await selectVolume(user, "5ml");
    expect(screen.getByText("R$ 89.90", { selector: "p" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Completo", exact: true }));
    expect(screen.queryByLabelText(/Volume/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fracionado", exact: true }));
    expect(screen.getByLabelText(/Volume/)).toHaveTextContent("Selecionar volume...");
    expect(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true })).toBeDisabled();
    await selectVolume(user, "2ml");
    await user.click(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true }));
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Sauvage");
    await addCompleteProduct(user, /^Sauvage Perfume/);
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Sauvage");
    await user.click(screen.getByRole("button", { name: /^Sauvage Body Splash/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Fracionado", exact: true })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Fracionado", exact: true }));
    await selectVolume(user, "10ml");
    await user.click(screen.getByRole("button", { name: "Cancelar seleção do produto" }));
    expect(screen.getByText("2 item(s)")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Volume/)).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Sauvage");
    await user.click(screen.getByRole("button", { name: /^Sauvage Body Splash/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Fracionado", exact: true })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Fracionado", exact: true }));
    await selectVolume(user, "10ml");
    await user.click(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true }));
    await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Cliente");
    await user.click(screen.getByRole("button", { name: /Cliente remoto/ }));
    await user.selectOptions(screen.getByRole("combobox"), "Pix");
    await reviewAndConfirmSale(user);
    await screen.findByRole("status");
    expect(apiClient.post).toHaveBeenCalledWith("/vendas", expect.objectContaining({ itens: [
      { produtoId: 1002, quantidade: 1 },
      { produtoId: 42, quantidade: 1 },
      { produtoId: 4010, quantidade: 1 },
    ] }));
  });

  it.each([
    { category: "Perfume", itemId: 1002, nome: "Decant Sauvage 2ml", volume: "2ml" },
    { category: "Body Splash", itemId: 4010, nome: "Body Splash Sauvage 10ml", volume: "10ml" },
  ])("blocks only the exhausted complete $category and still allows its fractionated bottle", async ({ category, itemId, nome, volume }) => {
    const exhaustedProduct = { ...product, nome: "Sauvage", categoriaNome: category, estoqueAtual: 0 };
    const bottle = { id: itemId, nome, precoVenda: 49.9, estoqueAtual: null, status: null };
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === "/clientes") return { data: { content: [customer], totalPages: 1 } };
      if (url === "/produtos") return { data: { content: [exhaustedProduct], totalPages: 1 } };
      if (url === "/vendas/itens-busca") return { data: [exhaustedProduct, bottle] };
      throw new Error(`Unexpected endpoint: ${url}`);
    });
    const user = userEvent.setup();
    await renderLoaded();
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Sauvage");
    const result = screen.getByRole("button", { name: new RegExp(`^Sauvage ${category}`) });
    expect(result).toBeEnabled();
    expect(result).not.toHaveTextContent(/esgotado/i);
    await user.click(result);
    expect(screen.getByText("Produto completo esgotado.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole("button", { name: "Fracionado", exact: true })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Fracionado", exact: true }));
    expect(screen.queryByText("Produto completo esgotado.")).not.toBeInTheDocument();
    await selectVolume(user, volume);
    expect(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Adicionar ao carrinho", exact: true }));
    expect(screen.getByLabelText(`Quantidade de ${nome}`)).toHaveValue(1);
    expect(screen.getByText("Fracionado")).toBeInTheDocument();
  });

  it("removes a selected customer after focusing the search and allows selecting again", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    const customerSearch = screen.getByPlaceholderText("Buscar por nome ou telefone...");
    await user.click(customerSearch);
    await user.click(screen.getByRole("button", { name: "Remover cliente" }));
    expect(customerSearch).toHaveValue("");
    expect(screen.getByText("Não vinculado")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione um cliente");
    expect(apiClient.post).not.toHaveBeenCalled();
    await user.type(customerSearch, "Cliente");
    await user.click(screen.getByRole("button", { name: /Cliente remoto/ }));
    expect((customerSearch as HTMLInputElement).value).toContain("Cliente remoto");
  });

  it("posts real IDs, groups quantities and registers a finalized in-person sale without lowering local stock", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
    await addCompleteProduct(user, /^Perfume remoto/);
    await user.type(screen.getByPlaceholderText("0"), "10");
    expect(screen.getByText("Total", { selector: "span" }).parentElement).toHaveTextContent("81.00");
    await reviewAndConfirmSale(user);
    expect(await screen.findByRole("status")).toHaveTextContent("Venda registrada como finalizada.");
    expect(apiClient.post).toHaveBeenCalledExactlyOnceWith("/vendas", { clienteId: 81, forma: "Pix", tipoVenda: "PRESENCIAL", desconto: 10, tipoDesconto: "PERCENTUAL", itens: [{ produtoId: 42, quantidade: 2 }] });
    expect(screen.getByText("Nenhum item adicionado ainda.")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("");
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
    await user.click(screen.getByRole("button", { name: /^Perfume remoto/ }));
    expect(screen.getByText("4 em estoque")).toBeInTheDocument();
  });

  it.each(["WhatsApp", "Site"])("registers online sales via %s with freight", async (channel) => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    await user.click(screen.getByRole("button", { name: "Online", exact: true }));
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(screen.getByRole("alert")).toHaveTextContent("canal");
    expect(apiClient.post).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Valor do frete (R$)"), { target: { value: "12.50" } });
    await user.click(screen.getByRole("button", { name: channel, exact: true }));
    await user.click(screen.getByRole("button", { name: /Valor fixo/ }));
    fireEvent.change(screen.getByPlaceholderText("0"), { target: { value: "5" } });
    expect(screen.getByText("Total", { selector: "span" }).parentElement).toHaveTextContent("52.50");
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    const modal = within(screen.getByRole("dialog", { name: "Confirmar venda" }));
    expect(modal.getByText(`Online - ${channel}`)).toBeInTheDocument();
    expect(modal.getByText("R$ 12,50")).toBeInTheDocument();
    expect(modal.getByText("- R$ 5,00")).toBeInTheDocument();
    expect(modal.getByText("R$ 52,50")).toBeInTheDocument();
    await user.click(modal.getByRole("button", { name: "Confirmar registro" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Venda registrada como pendente.");
    expect(apiClient.post).toHaveBeenCalledWith("/vendas", { clienteId: 81, forma: "Pix", tipoVenda: "ONLINE", canalVendaOnline: channel.toUpperCase(), desconto: 5, tipoDesconto: "VALOR", frete: 12.5, itens: [{ produtoId: 42, quantidade: 1 }] });
    await user.click(screen.getByRole("button", { name: "Online", exact: true }));
    expect(screen.getByLabelText("Valor do frete (R$)")).toHaveValue(null);
  });

  it("validates freight, retains it on failure and excludes it after switching to in-person", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    await user.click(screen.getByRole("button", { name: "Online", exact: true }));
    await user.click(screen.getByRole("button", { name: "Site", exact: true }));
    const freightInput = screen.getByLabelText("Valor do frete (R$)");
    fireEvent.change(freightInput, { target: { value: "-1" } });
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(screen.getByRole("alert")).toHaveTextContent("frete");
    expect(apiClient.post).not.toHaveBeenCalled();
    fireEvent.change(freightInput, { target: { value: "15" } });
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("offline"));
    await reviewAndConfirmSale(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível confirmar");
    expect(freightInput).toHaveValue(15);
    await user.click(screen.getByRole("button", { name: "Voltar para alterar" }));
    await user.click(screen.getByRole("button", { name: "Presencial", exact: true }));
    expect(screen.queryByLabelText("Valor do frete (R$)")).not.toBeInTheDocument();
    expect(screen.getByText("Total", { selector: "span" }).parentElement).toHaveTextContent("45.00");
    await reviewAndConfirmSale(user);
    await screen.findByRole("status");
    expect(apiClient.post).toHaveBeenLastCalledWith("/vendas", expect.not.objectContaining({ frete: expect.anything() }));
  });

  it.each([5, 1.5])("rejects unavailable or fractional quantities immediately: %s", async (quantity) => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Quantidade de Perfume remoto" }), { target: { value: String(quantity) } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Perfume remoto" })).toHaveValue(1);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("disables adding a complete product once the cart reaches its stock", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Quantidade de Perfume remoto" }), { target: { value: "4" } });
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
    await user.click(screen.getByRole("button", { name: /^Perfume remoto/ }));
    expect(screen.getByRole("button", { name: "Adicionar ao carrinho" })).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Perfume remoto" })).toHaveValue(4);
  });

  it("keeps the cart and form on HTTP failure and allows retry", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    vi.mocked(apiClient.post).mockRejectedValueOnce({ isAxiosError: true, response: { status: 400 } });
    await reviewAndConfirmSale(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("Dados inválidos");
    expect(screen.getByText("1 item(s)")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { hidden: true })).toHaveValue("Pix");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar registro" }));
    expect(await screen.findByRole("status")).toHaveTextContent("finalizada");
  });

  it("blocks repeated submissions and editing while the POST is pending", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    let resolveSale!: (response: unknown) => void;
    vi.mocked(apiClient.post).mockImplementationOnce(() => new Promise((resolve) => { resolveSale = resolve; }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(apiClient.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar registro" }));
    expect(await screen.findByRole("button", { name: "Registrando..." })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Registrando..." }));
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("combobox", { hidden: true })).toBeDisabled();
    expect(screen.getByLabelText("Quantidade de Perfume remoto")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Voltar para alterar" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await act(async () => { resolveSale({ status: 201, data: "" }); });
    expect(screen.getByRole("status")).toHaveTextContent("finalizada");
  });

  it("reports loading errors and reloads without inventing catalog entries", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("offline"));
    render(<SalesPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os produtos e clientes.");
    expect(screen.getByRole("button", { name: "Registrar venda" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Atualizar dados" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Registrar venda" })).toBeEnabled());
  });

  it.each([
    { input: "1133334444", expected: "(11) 3333-4444" },
    { input: "11999997777", expected: "(11) 99999-7777" },
    { input: "(11) 99999-7777abc123", expected: "(11) 99999-7777" },
  ])("masks customer phone input $input and allows clearing it", async ({ input, expected }) => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Cadastrar novo cliente" }));
    const phone = within(screen.getByRole("dialog")).getByLabelText(/Telefone/);

    fireEvent.change(phone, { target: { value: input } });
    expect(phone).toHaveValue(expected);
    await user.clear(phone);
    expect(phone).toHaveValue("");
  });

  it("creates a customer with email, retains errors and selects the backend ID", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Cadastrar novo cliente" }));
    const modal = within(screen.getByRole("dialog"));
    await user.click(modal.getByRole("button", { name: "Cadastrar", exact: true }));
    expect(apiClient.post).not.toHaveBeenCalled();
    await user.type(modal.getByLabelText(/Nome completo/), "Nova cliente");
    await user.type(modal.getByLabelText(/Telefone/), "11999997777");
    expect(modal.getByLabelText(/Telefone/)).toHaveValue("(11) 99999-7777");
    await user.type(modal.getByLabelText(/E-mail/), "nova@example.test");
    vi.mocked(apiClient.post).mockRejectedValueOnce({ isAxiosError: true, response: { status: 409 } });
    await user.click(modal.getByRole("button", { name: "Cadastrar", exact: true }));
    expect(await modal.findByRole("alert")).toHaveTextContent("Conflito");
    expect(modal.getByLabelText(/Nome completo/)).toHaveValue("Nova cliente");
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: 501, nome: "Nova cliente", telefone: "11999997777", email: "nova@example.test", status: 1 } });
    await user.click(modal.getByRole("button", { name: "Cadastrar", exact: true }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(apiClient.post).toHaveBeenCalledWith("/clientes", { nome: "Nova cliente", telefone: "11999997777", email: "nova@example.test" });
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
    await addCompleteProduct(user, /^Perfume remoto/);
    await user.selectOptions(screen.getByRole("combobox"), "Pix");
    await reviewAndConfirmSale(user);
    await screen.findByRole("status");
    expect(apiClient.post).toHaveBeenLastCalledWith("/vendas", expect.objectContaining({ clienteId: 501 }));
  });
});