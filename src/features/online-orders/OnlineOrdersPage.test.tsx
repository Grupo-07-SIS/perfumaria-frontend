import { useEffect, useRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "../../core/store/AppContext";
import { triggerBotpressOnlineFlow } from "../../core/services/botpress";
import { SalesHistoryPage } from "../sales-history/SalesHistoryPage";
import { OnlineOrdersPage } from "./OnlineOrdersPage";

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn(() => null) },
}));
vi.mock("../../core/services/botpress", () => ({
  triggerBotpressOnlineFlow: vi.fn().mockResolvedValue(undefined),
}));

function SeedOrders() {
  const { updateVenda } = useApp();
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    for (const canalOnline of ["whatsapp", "site"] as const) {
      updateVenda({
        id: canalOnline === "whatsapp" ? "V-1042" : "V-1037",
        data: "22/09/2026 10:00", cliente: `Pedido teste ${canalOnline}`,
        pagamento: "Pix", total: 100, tipoVenda: "online", canalOnline,
        frete: 15, desconto: 5, enviado: false,
        itens: [{ nome: "Perfume teste", quantidade: 2, valorUnitario: 45 }],
      });
    }
  }, [updateVenda]);
  return null;
}

function renderOrders() {
  return render(<AppProvider><SeedOrders /><OnlineOrdersPage /></AppProvider>);
}

function orderRow(channel: "whatsapp" | "site") {
  return screen.getByRole("row", { name: new RegExp(`Pedido teste ${channel}`) });
}

describe("OnlineOrders: caracterizacao dos pedidos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("combina busca, canal e status e recupera a lista apos resultado vazio", async () => {
    const user = userEvent.setup();
    renderOrders();
    expect(orderRow("whatsapp")).toHaveTextContent("Pendente");
    await user.click(screen.getByRole("button", { name: "Site", exact: true }));
    expect(orderRow("site")).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Pedido teste whatsapp/ })).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Buscar pedido ou cliente..."), "ausente");
    expect(within(screen.getByRole("table")).getByText("Nenhum pedido encontrado.")).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText("Buscar pedido ou cliente..."));
    expect(orderRow("site")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(screen.queryByRole("row", { name: /Pedido teste site/ })).not.toBeInTheDocument();
  });

  it("permite desistir do rastreio, finalizar WhatsApp e desfazer limpando rastreio", async () => {
    const user = userEvent.setup();
    renderOrders();
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Finalizar", exact: true }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }));
    expect(orderRow("whatsapp")).toHaveTextContent("Pendente");
    expect(triggerBotpressOnlineFlow).not.toHaveBeenCalled();
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Finalizar", exact: true }));
    await user.type(screen.getByPlaceholderText("Ex: BR123456789BR"), "  BR123456789BR  ");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Finalizar pedido" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Pedido teste whatsapp/ })).not.toBeInTheDocument();
    expect(triggerBotpressOnlineFlow).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      canalVenda: "whatsapp", codigoRastreio: "BR123456789BR",
      subtotal: 90, frete: 15, desconto: 5, totalVenda: 100,
      dadosPedido: [expect.objectContaining({ nome: "Perfume teste", quantidade: 2, totalItem: 90 })],
    }));
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(orderRow("whatsapp")).toHaveTextContent("BR123456789BR");
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Ver pedido" }));
    expect(screen.getByRole("dialog", { name: "Pedido Online" })).toHaveTextContent("BR123456789BR");
    await user.keyboard("{Escape}");
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Desfazer" }));
    await user.click(screen.getByRole("button", { name: "Pendentes", exact: true }));
    expect(orderRow("whatsapp")).toHaveTextContent("Pendente");
    expect(orderRow("whatsapp")).not.toHaveTextContent("BR123456789BR");
    expect(triggerBotpressOnlineFlow).toHaveBeenCalledTimes(1);
  });

  it("aceita finalizar WhatsApp sem codigo de rastreio", async () => {
    const user = userEvent.setup();
    renderOrders();
    await user.click(within(orderRow("whatsapp")).getByRole("button", { name: "Finalizar", exact: true }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Finalizar pedido" }));
    await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
    expect(orderRow("whatsapp")).toHaveTextContent("Finalizado");
    expect(triggerBotpressOnlineFlow).toHaveBeenCalledWith(expect.objectContaining({ codigoRastreio: undefined }));
  });

  it("mantem finalizacao do Site quando Botpress falha, sem solicitar rastreio", async () => {
    const user = userEvent.setup();
    vi.mocked(triggerBotpressOnlineFlow).mockRejectedValueOnce(new Error("Servico indisponivel"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      renderOrders();
      await user.click(within(orderRow("site")).getByRole("button", { name: "Finalizar", exact: true }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Finalizados", exact: true }));
      expect(orderRow("site")).toHaveTextContent("Finalizado");
      expect(triggerBotpressOnlineFlow).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ canalVenda: "site", codigoRastreio: undefined }));
      expect(consoleError).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ message: "Servico indisponivel" }));
    } finally {
      consoleError.mockRestore();
    }
  });

  it("so cancela apos confirmar e preserva o pedido cancelado no historico", async () => {
    const user = userEvent.setup();
    const view = renderOrders();
    await user.click(within(orderRow("site")).getByRole("button", { name: "Cancelar pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).getByRole("button", { name: "Fechar" }));
    expect(orderRow("site")).toHaveTextContent("Pendente");
    await user.click(within(orderRow("site")).getByRole("button", { name: "Cancelar pedido" }));
    await user.click(within(screen.getByRole("dialog", { name: "Cancelar Pedido" })).getByRole("button", { name: "Cancelar pedido" }));
    expect(screen.queryByRole("row", { name: /Pedido teste site/ })).not.toBeInTheDocument();
    view.rerender(<AppProvider><SalesHistoryPage /></AppProvider>);
    expect(orderRow("site")).toHaveTextContent("Cancelado");
    expect(orderRow("site")).toHaveTextContent("R$ 100,00");
    expect(screen.queryByRole("row", { name: /Pedido teste whatsapp/ })).not.toBeInTheDocument();
    expect(triggerBotpressOnlineFlow).not.toHaveBeenCalled();
  });
});