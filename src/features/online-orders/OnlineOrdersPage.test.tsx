import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../core/services/http-client";
import { triggerBotpressOnlineFlow } from "../../core/services/botpress";
import { OnlineOrdersPage } from "./OnlineOrdersPage";

vi.mock("../../core/services/http-client", () => ({
  apiClient: { get: vi.fn(), patch: vi.fn() },
}));
vi.mock("../../core/services/botpress", () => ({
  triggerBotpressOnlineFlow: vi.fn().mockResolvedValue(undefined),
}));

function makeOrder(id: number, canal: "WHATSAPP" | "SITE", tipoVenda = "ONLINE") {
  return {
    id, clienteNome: `Pedido teste ${canal.toLowerCase()}`, dataHora: "2026-09-22T10:00:00",
    forma: "PIX", valorFinal: 100, frete: 15, desconto: 5, status: "PENDENTE",
    tipoVenda, canalVendaOnline: canal,
    itens: [{ produtoNome: "Perfume teste", quantidade: 2, valorUnitario: 45 }],
  };
}

let orders: ReturnType<typeof makeOrder>[];

beforeEach(() => {
  vi.clearAllMocks();
  orders = [makeOrder(1042, "WHATSAPP"), makeOrder(1037, "SITE"), { ...makeOrder(9, "SITE", "PRESENCIAL"), clienteNome: "Balcao" }];
  vi.mocked(apiClient.get).mockImplementation((async (url: string) => {
    const id = Number(url.split("/")[2]);
    return { data: url === "/vendas" ? { content: orders, totalPages: 1 } : orders.find(o => o.id === id) };
  }) as never);
  vi.mocked(apiClient.patch).mockImplementation((async (url: string, body: { status: string }) => {
    const order = orders.find(o => o.id === Number(url.split("/")[2]))!;
    order.status = body.status;
    return { data: order };
  }) as never);
});

async function renderOrders() {
  render(<OnlineOrdersPage />);
  await screen.findByRole("row", { name: /Pedido teste whatsapp/ });
}

function orderRow(channel: "whatsapp" | "site") {
  return screen.getByRole("row", { name: new RegExp(`Pedido teste ${channel}`) });
}

describe("OnlineOrders", () => {
  it("lista apenas pedidos online do backend e combina filtros", async () => {
    const user = userEvent.setup();
    await renderOrders();
    expect(screen.queryByText("Balcao")).not.toBeInTheDocument();
    expect(orderRow("whatsapp")).toHaveTextContent("Pendente");
    await user.click(screen.getByRole("button", { name: "Site", exact: true }));
    expect(orderRow("site")).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Pedido teste whatsapp/ })).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Buscar pedido ou cliente..."), "ausente");
    expect(within(screen.getByRole("table")).getByText("Nenhum pedido encontrado.")).toBeInTheDocument();
  });

  it("finaliza WhatsApp com rastreio, aciona Botpress e desfaz", async () => {
    const user = userEvent.setup();
    await renderOrders();
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Finalizar", exact: true }));
    await user.type(screen.getByPlaceholderText("Ex: BR123456789BR"), "  BR123456789BR  ");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Finalizar pedido" }));
    await vi.waitFor(() => expect(triggerBotpressOnlineFlow).toHaveBeenCalledTimes(1));
    expect(apiClient.patch).toHaveBeenCalledWith("/vendas/1042", { status: "FINALIZADA" });
    expect(triggerBotpressOnlineFlow).toHaveBeenCalledWith(expect.objectContaining({
      canalVenda: "whatsapp", codigoRastreio: "BR123456789BR", subtotal: 90, totalVenda: 100,
    }));
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(orderRow("whatsapp")).toHaveTextContent("BR123456789BR");
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Desfazer" }));
    await user.click(screen.getByRole("button", { name: "Pendentes", exact: true }));
    expect(await screen.findByRole("row", { name: /Pedido teste whatsapp/ })).not.toHaveTextContent("BR123456789BR");
    expect(apiClient.patch).toHaveBeenLastCalledWith("/vendas/1042", { status: "PENDENTE" });
  });

  it("mantem finalizacao do Site quando Botpress falha", async () => {
    const user = userEvent.setup();
    vi.mocked(triggerBotpressOnlineFlow).mockRejectedValueOnce(new Error("Servico indisponivel"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await renderOrders();
      await user.click(within(orderRow("site")).getByRole("button", { name: "Finalizar", exact: true }));
      await vi.waitFor(() => expect(consoleError).toHaveBeenCalled());
      await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
      expect(orderRow("site")).toHaveTextContent("Finalizado");
    } finally {
      consoleError.mockRestore();
    }
  });

  it("cancela somente apos confirmar", async () => {
    const user = userEvent.setup();
    await renderOrders();
    await user.click(within(orderRow("site")).getByRole("button", { name: "Cancelar pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).getByRole("button", { name: "Fechar" }));
    expect(apiClient.patch).not.toHaveBeenCalled();
    await user.click(within(orderRow("site")).getByRole("button", { name: "Cancelar pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).getByRole("button", { name: "Cancelar pedido" }));
    await vi.waitFor(() => expect(screen.queryByRole("row", { name: /Pedido teste site/ })).not.toBeInTheDocument());
    expect(apiClient.patch).toHaveBeenCalledWith("/vendas/1037", { status: "CANCELADA" });
    expect(triggerBotpressOnlineFlow).not.toHaveBeenCalled();
  });

  it("mostra erro quando a listagem falha", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("falha"));
    render(<OnlineOrdersPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os pedidos online.");
  });
});
