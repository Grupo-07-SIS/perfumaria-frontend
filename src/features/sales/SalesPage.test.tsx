import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { triggerBotpressPresencialFlow } from "../../core/services/botpress";
import { SalesHistoryPage } from "../sales-history/SalesHistoryPage";
import { SalesPage } from "./SalesPage";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn(() => null) },
}));
vi.mock("../../core/services/botpress", () => ({
  triggerBotpressPresencialFlow: vi.fn().mockResolvedValue(undefined),
}));

async function addChanel(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Buscar produto ou decant..."), "Chanel");
  await user.click(screen.getByRole("button", { name: /^Chanel N°5/ }));
}

function expectTotal(amount: string) {
  expect(screen.getByText("Total", { selector: "span" }).parentElement).toHaveTextContent(`R$ ${amount}`);
}

describe("Sales: caracterizacao do PDV", () => {
  beforeEach(() => vi.clearAllMocks());

  it("impede finalizar um carrinho vazio sem cliente e pagamento", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesPage /></AppProvider>);
    expect(screen.getByText("Nenhum item adicionado ainda.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finalizar Venda" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Adicione pelo menos um item ao carrinho.");
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione um cliente.");
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione o tipo de pagamento.");
    expect(triggerBotpressPresencialFlow).not.toHaveBeenCalled();
  });

  it("agrupa o mesmo produto, recalcula desconto e frete e limita desconto ao subtotal", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesPage /></AppProvider>);
    await addChanel(user);
    await addChanel(user);
    expect(screen.getByText("1 item(s)")).toBeInTheDocument();
    expect(screen.getByText("Subtotal (2 itens)").parentElement).toHaveTextContent("R$ 90.00");
    await user.type(screen.getByPlaceholderText("0"), "10");
    expectTotal("81.00");
    await user.click(screen.getByRole("button", { name: "Online", exact: true }));
    await user.type(screen.getByPlaceholderText("0,00"), "15");
    expectTotal("96.00");
    await user.click(screen.getByRole("button", { name: /Valor fixo/ }));
    await user.clear(screen.getByPlaceholderText("0"));
    await user.type(screen.getByPlaceholderText("0"), "200");
    expect(screen.getByText("- R$ 90.00")).toBeInTheDocument();
    expectTotal("15.00");
    await user.click(screen.getByRole("button", { name: "Presencial", exact: true }));
    expectTotal("0.00");
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByText("Nenhum item adicionado ainda.")).toBeInTheDocument();
    expectTotal("0.00");
  });

  it("finaliza uma venda presencial, limpa o carrinho e baixa apenas a quantidade vendida", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesPage /></AppProvider>);
    await addChanel(user);
    fireEvent.change(screen.getAllByRole("spinbutton")[0], { target: { value: "2" } });
    await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Ana Lima");
    await user.click(screen.getByRole("button", { name: /Ana Lima/ }));
    await user.selectOptions(screen.getByRole("combobox"), "Pix");
    await user.type(screen.getByPlaceholderText("0"), "10");
    await user.click(screen.getByRole("button", { name: "Finalizar Venda" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Venda finalizada com sucesso!");
    expect(screen.getByText("Nenhum item adicionado ainda.")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.getByPlaceholderText("Buscar por nome ou telefone...")).toHaveValue("");
    expect(triggerBotpressPresencialFlow).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      nomeCliente: "Ana Lima", subtotal: 90, desconto: 9, totalVenda: 81,
      formaPagamento: "Pix", canalVenda: "presencial",
      dadosPedido: [expect.objectContaining({ nome: "Chanel N°5", quantidade: 2, totalItem: 90 })],
    }));
    await user.type(screen.getByPlaceholderText("Buscar produto ou decant..."), "Chanel");
    expect(screen.getByRole("button", { name: /^Chanel N°5/ })).toHaveTextContent("2 em est.");
  });

  it("comportamento atual permite vender acima do estoque e limita saldo a zero", async () => {
    const user = userEvent.setup();
    const view = render(<AppProvider><SalesPage /></AppProvider>);
    await addChanel(user);
    fireEvent.change(screen.getAllByRole("spinbutton")[0], { target: { value: "5" } });
    await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Ana Lima");
    await user.click(screen.getByRole("button", { name: /Ana Lima/ }));
    await user.selectOptions(screen.getByRole("combobox"), "Pix");
    await user.click(screen.getByRole("button", { name: "Finalizar Venda" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Venda finalizada com sucesso!");
    await user.type(screen.getByPlaceholderText("Buscar produto ou decant..."), "Chanel");
    expect(screen.getByRole("button", { name: /^Chanel N°5/ })).toHaveTextContent("Esgotado");
    view.rerender(<AppProvider><SalesHistoryPage /></AppProvider>);
    expect(screen.getByRole("row", { name: /V-1043/ })).toHaveTextContent("R$ 225,00");
    expect(screen.getByRole("row", { name: /V-1043/ })).toHaveTextContent("Finalizado");
  });

  it("falha de notificacao nao desfaz a venda gravada nem a baixa de estoque", async () => {
    const user = userEvent.setup();
    vi.mocked(triggerBotpressPresencialFlow).mockRejectedValueOnce(new Error("Servico indisponivel"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const view = render(<AppProvider><SalesPage /></AppProvider>);
      await addChanel(user);
      await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Ana Lima");
      await user.click(screen.getByRole("button", { name: /Ana Lima/ }));
      await user.selectOptions(screen.getByRole("combobox"), "Pix");
      await user.click(screen.getByRole("button", { name: "Finalizar Venda" }));
      expect(await screen.findByRole("status")).toHaveTextContent("Venda finalizada com sucesso!");
      expect(triggerBotpressPresencialFlow).toHaveBeenCalledTimes(1);
      await user.type(screen.getByPlaceholderText("Buscar produto ou decant..."), "Chanel");
      expect(screen.getByRole("button", { name: /^Chanel N°5/ })).toHaveTextContent("3 em est.");
      view.rerender(<AppProvider><SalesHistoryPage /></AppProvider>);
      expect(screen.getByRole("row", { name: /V-1043/ })).toHaveTextContent("R$ 45,00");
      expect(screen.getByRole("row", { name: /V-1043/ })).toHaveTextContent("Ana Lima");
      expect(consoleError).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ message: "Servico indisponivel" }));
    } finally {
      consoleError.mockRestore();
    }
  });

  it("exige canal e frete na venda online e aceita frete zero sem disparar fluxo presencial", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesPage /></AppProvider>);
    await addChanel(user);
    await user.type(screen.getByPlaceholderText("Buscar por nome ou telefone..."), "Ana Lima");
    await user.click(screen.getByRole("button", { name: /Ana Lima/ }));
    await user.selectOptions(screen.getByRole("combobox"), "Pix");
    await user.click(screen.getByRole("button", { name: "Online", exact: true }));
    await user.click(screen.getByRole("button", { name: "Finalizar Venda" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione o canal da venda online");
    expect(screen.getByRole("alert")).toHaveTextContent("Informe o valor do frete");
    await user.click(screen.getByRole("button", { name: "WhatsApp" }));
    await user.type(screen.getByPlaceholderText("0,00"), "0");
    await user.click(screen.getByRole("button", { name: "Finalizar Venda" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Venda finalizada com sucesso!");
    expect(triggerBotpressPresencialFlow).not.toHaveBeenCalled();
  });
});