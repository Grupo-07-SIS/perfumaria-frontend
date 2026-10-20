import { act, render, screen, within } from "@testing-library/react";
import type { AxiosResponse } from "axios";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../core/services/http-client";
import { OnlineOrdersPage } from "./OnlineOrdersPage";
const { useAppMock } = vi.hoisted(() => ({ useAppMock: vi.fn() }));
vi.mock("../../core/store/AppContext", () => ({ useApp: useAppMock }));

vi.mock("../../core/services/http-client", () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

function makeOrder(id: number, canal: "WHATSAPP" | "SITE", tipoVenda = "ONLINE") {
  return {
    id, clienteNome: `Pedido teste ${canal.toLowerCase()}`, dataHoraVenda: "2026-09-22T10:00:00",
    forma: "PIX", valorFinal: 100, frete: 15, desconto: 5, status: "PENDENTE",
    tipoVenda, canalVendaOnline: canal, codigoRastreio: "",
    itens: [{ produtoNome: "Perfume teste", categoriaNome: "Perfume", quantidade: 2, valorUnitario: 45 }],
  };
}

let orders: ReturnType<typeof makeOrder>[];

beforeEach(() => {
  vi.clearAllMocks();
  useAppMock.mockReturnValue({ currentUser: { cargo: "Administrador" } });
  orders = [makeOrder(1042, "WHATSAPP"), makeOrder(1037, "SITE"), { ...makeOrder(9, "SITE", "PRESENCIAL"), clienteNome: "Balcao" }];
  vi.mocked(apiClient.get).mockImplementation((async (url: string) => {
    const id = Number(url.split("/").at(-1));
    return { data: url === "/vendas/pedidos-online" ? { content: orders, totalPages: 1 } : orders.find(o => o.id === id) };
  }) as never);
  vi.mocked(apiClient.patch).mockImplementation((async (url: string, body: { status?: string; codigoRastreio?: string }) => {
    const id = Number(url.match(/\/(\d+)(?:\/finalizar)?$/)?.[1]);
    const order = orders.find(o => o.id === id)!;
    const status = url.endsWith("/finalizar") ? "FINALIZADA" : body.status!;
    if (status !== "FINALIZADA" && order.codigoRastreio) {
      throw new Error("TRACKING_REQUIRES_FINALIZED_ORDER");
    }
    order.status = status;
    if (body.codigoRastreio !== undefined) order.codigoRastreio = body.codigoRastreio;
    return { data: order };
  }) as never);
  vi.mocked(apiClient.delete).mockImplementation((async (url: string) => {
    const id = Number(url.split("/")[2]);
    const order = orders.find(o => o.id === id);
    if (order) order.codigoRastreio = undefined;
    return { status: 204, data: undefined };
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
  it("pagina pedidos e reinicia ao alterar canal ou busca", async () => {
    orders = Array.from({ length: 25 }, (_, index) => ({ ...makeOrder(index + 2000, index % 2 === 0 ? "WHATSAPP" : "SITE"), clienteNome: index === 0 ? "Pedido teste whatsapp" : `Pedido paginado ${index + 1}` }));
    const user = userEvent.setup();
    await renderOrders();
    expect(screen.getAllByText("Exibindo 1 a 10 de 25 pedido(s)")).toHaveLength(2);
    expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(10);
    await user.click(screen.getAllByRole("button", { name: "3", exact: true })[0]);
    expect(screen.getAllByText("Exibindo 21 a 25 de 25 pedido(s)")).toHaveLength(2);
    expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(5);
    await user.click(within(screen.getByRole("group", { name: "Canal dos pedidos" })).getByRole("button", { name: "Site", exact: true }));
    expect(screen.getAllByText("Exibindo 1 a 10 de 12 pedido(s)")).toHaveLength(2);
    await user.type(screen.getByPlaceholderText("Buscar pedido ou cliente..."), "Pedido paginado 24");
    expect(screen.getAllByText("Exibindo 1 a 1 de 1 pedido(s)")).toHaveLength(2);
  });

  it.each(["site", "whatsapp"] as const)("bloqueia finalizacao duplicada de %s e permite nova tentativa", async canal => {
    const user = userEvent.setup();
    await renderOrders();
    let rejectUpdate!: (reason: Error) => void;
    vi.mocked(apiClient.patch).mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectUpdate = reject; }));
    const finalize = within(orderRow(canal)).getByRole("button", { name: "Finalizar", exact: true });
    if (canal === "whatsapp") {
      await user.click(finalize);
      await user.type(screen.getByPlaceholderText("Ex: BR123456789BR"), "BR123456789BR");
      await user.dblClick(within(screen.getByRole("dialog")).getByRole("button", { name: "Finalizar pedido" }));
      expect(screen.getByPlaceholderText("Ex: BR123456789BR")).toBeDisabled();
      await user.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    } else {
      await user.dblClick(finalize);
      expect(finalize).toBeDisabled();
    }
    expect(apiClient.patch).toHaveBeenCalledTimes(1);
    await act(async () => { rejectUpdate(new Error("Falha simulada")); });
    if (canal === "whatsapp") {
      const dialog = within(screen.getByRole("dialog"));
      expect(dialog.getByRole("alert")).toHaveTextContent("Não foi possível atualizar o pedido.");
      expect(screen.getByPlaceholderText("Ex: BR123456789BR")).toHaveValue("BR123456789BR");
      await user.click(dialog.getByRole("button", { name: "Finalizar pedido" }));
    } else {
      expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível atualizar o pedido.");
      await user.click(finalize);
    }
    expect(apiClient.patch).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(orderRow(canal)).toHaveTextContent("Finalizado");
  });

  it("nao reabre detalhes quando a resposta chega depois de fechar o modal", async () => {
    const user = userEvent.setup();
    await renderOrders();
    let resolveDetails!: (response: AxiosResponse) => void;
    vi.mocked(apiClient.get).mockImplementationOnce(() => new Promise(resolve => { resolveDetails = resolve; }));
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Ver pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Pedido Online" })).getAllByRole("button", { name: "Fechar" }).at(-1)!);
    await act(async () => { resolveDetails({ data: orders[0] } as AxiosResponse); });
    expect(screen.queryByRole("dialog", { name: "Pedido Online" })).not.toBeInTheDocument();
  });

  it("ignora detalhes de pedido anterior quando outro ja foi aberto", async () => {
    const user = userEvent.setup();
    await renderOrders();
    let resolveDetails!: (response: AxiosResponse) => void;
    vi.mocked(apiClient.get).mockImplementationOnce(() => new Promise(resolve => { resolveDetails = resolve; }));
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Ver pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Pedido Online" })).getAllByRole("button", { name: "Fechar" }).at(-1)!);
    await user.click(within(orderRow("site")).getByRole("button", { name: "Ver pedido" }));
    expect(screen.getByRole("dialog", { name: "Pedido Online" })).toHaveTextContent("Pedido teste site");
    await act(async () => { resolveDetails({ data: orders[0] } as AxiosResponse); });
    expect(screen.getByRole("dialog", { name: "Pedido Online" })).toHaveTextContent("Pedido teste site");
    expect(screen.getByRole("dialog", { name: "Pedido Online" })).not.toHaveTextContent("Pedido teste whatsapp");
  });

  it.each(["site", "whatsapp"] as const)("permite ao funcionario finalizar %s sem cancelar ou desfazer", async canal => {
    useAppMock.mockReturnValue({ currentUser: { cargo: "Funcionário" } });
    const user = userEvent.setup();
    await renderOrders();
    expect(screen.queryByRole("button", { name: /Cancelar/ })).not.toBeInTheDocument();
    await user.click(within(orderRow(canal)).getByRole("button", { name: "Finalizar", exact: true }));
    if (canal === "whatsapp") {
      await user.type(screen.getByPlaceholderText("Ex: BR123456789BR"), "BR123456789BR");
      await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Finalizar pedido" }));
    }
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(orderRow(canal)).toHaveTextContent("Finalizado");
    expect(screen.queryByRole("button", { name: "Desfazer" })).not.toBeInTheDocument();
    expect(apiClient.patch).toHaveBeenCalledWith(`/vendas/pedidos-online/${canal === "site" ? 1037 : 1042}/finalizar`,
      canal === "site" ? {} : { codigoRastreio: "BR123456789BR" });
  });

  it("organiza os filtros em segmentos iguais e informa a selecao", async () => {
    const user = userEvent.setup();
    await renderOrders();
    const statusGroup = screen.getByRole("group", { name: "Status dos pedidos" });
    const channelGroup = screen.getByRole("group", { name: "Canal dos pedidos" });
    expect(statusGroup).toHaveClass("grid", "grid-cols-3", "min-w-0", "sm:flex");
    expect(channelGroup).toHaveClass("grid", "grid-cols-3", "min-w-0", "sm:flex");
    expect(statusGroup.parentElement).toHaveClass("w-full", "sm:w-auto");
    within(statusGroup).getAllByRole("button").forEach(button => {
      expect(button).toHaveClass("h-11", "sm:h-auto", "sm:px-3", "sm:py-1.5");
    });
    expect(within(statusGroup).getAllByRole("button")).toHaveLength(3);
    expect(within(channelGroup).getAllByRole("button")).toHaveLength(3);
    expect(within(statusGroup).getByRole("button", { name: "Pendentes", exact: true })).toHaveAttribute("aria-pressed", "true");
    await user.click(within(statusGroup).getByRole("button", { name: "Todos", exact: true }));
    await user.click(within(channelGroup).getByRole("button", { name: "Site", exact: true }));
    expect(within(statusGroup).getByRole("button", { name: "Todos", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(within(channelGroup).getByRole("button", { name: "Site", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(within(channelGroup).getByRole("button", { name: "Todos canais", exact: true })).toHaveAttribute("aria-pressed", "false");
    expect(orderRow("site")).toBeInTheDocument();
  });

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

  it("reserva uma coluna fixa para visualizar os cards e preserva a abertura do pedido", async () => {
    const user = userEvent.setup();
    await renderOrders();
    const detailButtons = screen.getAllByRole("button", { name: "Ver detalhes", exact: true });
    expect(detailButtons).toHaveLength(2);
    detailButtons.forEach(button => {
      expect(button).toHaveClass("h-9", "w-9", "shrink-0");
      expect(button).toHaveAttribute("title", "Ver detalhes");
      expect(button.parentElement).toHaveClass("grid-cols-[minmax(0,1fr)_2.25rem]");
    });
    await user.click(detailButtons[0]);
    expect(await screen.findByRole("dialog", { name: "Pedido Online" })).toHaveTextContent("Pedido teste whatsapp");
  });

  it("exibe data e hora da venda ao abrir o recibo do pedido online", async () => {
    const user = userEvent.setup();
    await renderOrders();
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Ver pedido" }));
    expect(await screen.findByRole("dialog", { name: "Pedido Online" })).toHaveTextContent("22/09/2026 10:00");
    expect(within(screen.getByRole("dialog", { name: "Pedido Online" })).getByText("Perfume", { exact: true })).toBeInTheDocument();
  });

  it("finaliza WhatsApp com rastreio e desfaz", async () => {
    const user = userEvent.setup();
    orders[0].codigoRastreio = "BRRASTREIOANTERIOR";
    await renderOrders();
    expect(orderRow("whatsapp")).not.toHaveTextContent("BRRASTREIOANTERIOR");
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Finalizar", exact: true }));
    const rastreioDialog = screen.getByRole("dialog");
    await user.type(screen.getByPlaceholderText("Ex: BR123456789BR"), "  BR123456789BR  ");
    await user.click(within(rastreioDialog).getByRole("button", { name: "Finalizar pedido" }));
    expect(apiClient.patch).toHaveBeenCalledWith("/vendas/pedidos-online/1042/finalizar", { codigoRastreio: "BR123456789BR" });
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(orderRow("whatsapp")).not.toHaveTextContent("BR123456789BR");
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Ver pedido" }));
    expect(await screen.findByRole("dialog", { name: "Pedido Online" })).toHaveTextContent("BR123456789BR");
    await user.click(within(screen.getByRole("dialog", { name: "Pedido Online" })).getAllByRole("button", { name: "Fechar" }).at(-1)!);
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Desfazer" }));
    await user.click(screen.getByRole("button", { name: "Pendentes", exact: true }));
    expect(await screen.findByRole("row", { name: /Pedido teste whatsapp/ })).not.toHaveTextContent("BR123456789BR");
    expect(apiClient.patch).toHaveBeenLastCalledWith("/vendas/1042", { status: "PENDENTE" });
    expect(apiClient.delete).toHaveBeenCalledWith("/vendas/1042/codigo-rastreio");
    expect(vi.mocked(apiClient.delete).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(apiClient.patch).mock.invocationCallOrder[1]);
  });

  it("keeps a WhatsApp order finalized when removing tracking fails", async () => {
    const user = userEvent.setup();
    orders[0].status = "FINALIZADA";
    orders[0].codigoRastreio = "BR123456789BR";
    vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error("DELETE_FAILED"));
    render(<OnlineOrdersPage />);
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    await screen.findByRole("row", { name: /Pedido teste whatsapp/ });
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Desfazer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível atualizar o pedido.");
    expect(apiClient.patch).not.toHaveBeenCalled();
    expect(orderRow("whatsapp")).toHaveTextContent("Finalizado");
    expect(orders[0].codigoRastreio).toBe("BR123456789BR");
  });

  it("removes tracking before cancelling a finalized WhatsApp order", async () => {
    const user = userEvent.setup();
    orders[0].status = "FINALIZADA";
    orders[0].codigoRastreio = "BR123456789BR";
    render(<OnlineOrdersPage />);
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    await screen.findByRole("row", { name: /Pedido teste whatsapp/ });
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Cancelar pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).getByRole("button", { name: "Cancelar pedido" }));

    await vi.waitFor(() => expect(screen.queryByRole("row", { name: /Pedido teste whatsapp/ })).not.toBeInTheDocument());
    expect(apiClient.patch).toHaveBeenCalledWith("/vendas/1042", { status: "CANCELADA" });
    expect(vi.mocked(apiClient.delete).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(apiClient.patch).mock.invocationCallOrder[0]);
  });

  it("keeps cancellation confirmation open when the update fails", async () => {
    const user = userEvent.setup();
    await renderOrders();
    vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error("PATCH_FAILED"));
    await user.click(within(orderRow("site")).getByRole("button", { name: "Cancelar pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).getByRole("button", { name: "Cancelar pedido" }));

    expect(await within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).findByRole("alert")).toHaveTextContent("Não foi possível atualizar o pedido.");
    expect(screen.getByRole("dialog", { name: "Cancelar Pedido" })).toBeInTheDocument();
    await user.click(within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).getByRole("button", { name: "Fechar" }));
    expect(orderRow("site")).toHaveTextContent("Pendente");
  });

  it("finaliza WhatsApp sem registrar rastreio", async () => {
    const user = userEvent.setup();
    await renderOrders();
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Finalizar", exact: true }));
    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByLabelText("Código de rastreio (opcional)")).not.toBeRequired();
    await user.click(dialog.getByRole("button", { name: "Finalizar pedido" }));
    expect(apiClient.patch).toHaveBeenCalledWith("/vendas/pedidos-online/1042/finalizar", {});
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(orderRow("whatsapp")).toHaveTextContent("Finalizado");
  });

  it("desfaz pedido Site sem enviar o campo de rastreio exclusivo do WhatsApp", async () => {
    const user = userEvent.setup();
    orders[1].status = "FINALIZADA";
    await renderOrders();
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    await user.click(within(orderRow("site")).getByRole("button", { name: "Desfazer" }));

    expect(apiClient.patch).toHaveBeenLastCalledWith("/vendas/1037", { status: "PENDENTE" });
    expect(apiClient.delete).not.toHaveBeenCalled();
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
  });

  it("mostra erro quando a listagem falha", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("falha"));
    render(<OnlineOrdersPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar os pedidos online.");
  });
});
