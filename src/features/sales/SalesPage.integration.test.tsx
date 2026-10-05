import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../core/services/http-client";
import { triggerBotpressPresencialFlow } from "../../core/services/botpress";
import { SalesPage } from "./SalesPage";

vi.mock("../../core/services/http-client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));
vi.mock("../../core/services/botpress", () => ({ triggerBotpressPresencialFlow: vi.fn() }));

const product = { id: 42, nome: "Perfume remoto", precoVenda: 45, estoqueAtual: 4, status: 1 };
const customer = { id: 81, nome: "Cliente remoto", email: "cliente@example.test", telefone: "11999998888", status: 1 };

async function renderLoaded() {
  render(<SalesPage />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Registrar venda" })).toBeEnabled());
}

async function fillSale(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
  await user.click(screen.getByRole("button", { name: /^Perfume remoto/ }));
  await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Cliente");
  await user.click(screen.getByRole("button", { name: /Cliente remoto/ }));
  await user.selectOptions(screen.getByRole("combobox"), "Pix");
}

describe("Sales backend integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    expect(within(perfume).getByText("Perfume completo")).toBeInTheDocument();
    expect(within(bodySplash).getByText("Body Splash completo")).toBeInTheDocument();
    await user.click(bodySplash);
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
    const decant = await screen.findByRole("button", { name: /^Decant Sauvage Fracionado 2ml/ });
    expect(decant).toBeEnabled();
    expect(within(decant).getByText("Decant Sauvage")).toBeInTheDocument();
    expect(within(decant).queryByText("Decant Sauvage 2ml")).not.toBeInTheDocument();
    expect(within(decant).getByText("2ml")).toHaveAttribute("data-slot", "badge");
    expect(within(decant).getByText("2ml").parentElement).toHaveTextContent("R$ 49.90");
    expect(within(decant).getByText("Fracionado")).toBeInTheDocument();
    expect(decant).not.toHaveTextContent("em est.");
    expect(apiClient.get).toHaveBeenCalledWith("/vendas/itens-busca", { params: { nome: "Sauvage" } });
    await user.click(decant);
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Body Splash");
    const bodySplash = await screen.findByRole("button", { name: /^Body Splash Sauvage Fracionado 10ml/ });
    expect(within(bodySplash).getByText("Body Splash Sauvage")).toBeInTheDocument();
    expect(within(bodySplash).queryByText("Body Splash Sauvage 10ml")).not.toBeInTheDocument();
    expect(within(bodySplash).getByText("10ml")).toHaveAttribute("data-slot", "badge");
    expect(within(bodySplash).getByText("10ml").parentElement).toHaveTextContent("R$ 69.90");
    expect(within(bodySplash).getByText("Fracionado")).toBeInTheDocument();
    await user.click(bodySplash);
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Decant Sauvage 2ml" })).toHaveValue(1);
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Body Splash Sauvage 10ml" })).not.toHaveAttribute("max");
    expect(screen.getAllByText("Fracionado")).toHaveLength(2);
    expect(screen.queryByText("Produto", { exact: true })).not.toBeInTheDocument();
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

  it("posts real IDs, groups quantities and registers a pending sale without lowering local stock", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
    await user.click(screen.getByRole("button", { name: /^Perfume remoto/ }));
    await user.type(screen.getByPlaceholderText("0"), "10");
    expect(screen.getByText("Total", { selector: "span" }).parentElement).toHaveTextContent("81.00");
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Venda registrada como pendente.");
    expect(apiClient.post).toHaveBeenCalledExactlyOnceWith("/vendas", { clienteId: 81, forma: "Pix", tipoVenda: "PRESENCIAL", desconto: 10, tipoDesconto: "PERCENTUAL", itens: [{ produtoId: 42, quantidade: 2 }] });
    expect(screen.getByText("Nenhum item adicionado ainda.")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(triggerBotpressPresencialFlow).not.toHaveBeenCalled();
    await user.type(screen.getByPlaceholderText("Buscar produto..."), "Perfume");
    expect(screen.getByRole("button", { name: /^Perfume remoto/ })).toHaveTextContent("4 em est.");
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
    await screen.findByRole("status");
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
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível confirmar");
    expect(freightInput).toHaveValue(15);
    await user.click(screen.getByRole("button", { name: "Presencial", exact: true }));
    expect(screen.queryByLabelText("Valor do frete (R$)")).not.toBeInTheDocument();
    expect(screen.getByText("Total", { selector: "span" }).parentElement).toHaveTextContent("45.00");
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    await screen.findByRole("status");
    expect(apiClient.post).toHaveBeenLastCalledWith("/vendas", expect.not.objectContaining({ frete: expect.anything() }));
  });

  it.each([5, 1.5])("blocks unavailable or fractional quantities: %s", async (quantity) => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Quantidade de Perfume remoto" }), { target: { value: String(quantity) } });
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("keeps the cart and form on HTTP failure and allows retry", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    vi.mocked(apiClient.post).mockRejectedValueOnce({ isAxiosError: true, response: { status: 400 } });
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Dados inválidos");
    expect(screen.getByText("1 item(s)")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("Pix");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(await screen.findByRole("status")).toHaveTextContent("pendente");
  });

  it("blocks repeated submissions and editing while the POST is pending", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await fillSale(user);
    let resolveSale!: (response: unknown) => void;
    vi.mocked(apiClient.post).mockImplementationOnce(() => new Promise((resolve) => { resolveSale = resolve; }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar venda" }));
    expect(await screen.findByRole("button", { name: "Registrando..." })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Registrando..." }));
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: "Quantidade de Perfume remoto" })).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await act(async () => { resolveSale({ status: 201, data: "" }); });
    expect(screen.getByRole("status")).toHaveTextContent("pendente");
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
    await user.click(screen.getByRole("button", { name: /^Perfume remoto/ }));
    await user.selectOptions(screen.getByRole("combobox"), "Pix");
    await user.click(screen.getByRole("button", { name: "Registrar venda" }));
    await screen.findByRole("status");
    expect(apiClient.post).toHaveBeenLastCalledWith("/vendas", expect.objectContaining({ clienteId: 501 }));
  });
});