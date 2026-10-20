import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientGetMock, apiClientPatchMock, apiClientDeleteMock } = vi.hoisted(() => ({
  apiClientGetMock: vi.fn(),
  apiClientPatchMock: vi.fn(),
  apiClientDeleteMock: vi.fn(),
}));

vi.mock("../../../core/services/http-client", () => ({
  apiClient: {
    get: apiClientGetMock,
    patch: apiClientPatchMock,
    delete: apiClientDeleteMock,
  },
}));

import { salesHistoryRepository } from "./sales-history.repository";

const saleDto = {
  id: 19,
  clienteNome: "Maria Silva",
  dataHoraVenda: "2026-04-08T14:30:00",
  status: "FINALIZADA" as const,
  tipoVenda: "ONLINE" as const,
  canalVendaOnline: "WHATSAPP" as const,
  codigoRastreio: "BR123456789XX",
  frete: 15,
  forma: "CARTAO_CREDITO",
  valorFinal: 705,
};

describe("salesHistoryRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads /vendas and maps API fields to the history model", async () => {
    apiClientGetMock.mockResolvedValue({ data: [saleDto] });

    await expect(salesHistoryRepository.listSales()).resolves.toEqual([
      expect.objectContaining({
        id: "V-19",
        data: "08/04/2026 14:30",
        cliente: "Maria Silva",
        pagamento: "Cartão de crédito",
        total: 705,
        tipoVenda: "online",
        canalOnline: "whatsapp",
        codigoRastreio: "BR123456789XX",
        enviado: true,
        itens: [],
      }),
    ]);
    expect(apiClientGetMock).toHaveBeenCalledWith("/vendas", { params: { page: 0, size: 100 } });
  });

  it("reads all pages and preserves fractional item type and volume", async () => {
    apiClientGetMock
      .mockResolvedValueOnce({ data: { content: [saleDto], totalPages: 2 } })
      .mockResolvedValueOnce({ data: { content: [{
        ...saleDto,
        id: 20,
        status: "CANCELADA",
        itens: [{ produtoNome: "Sauvage", categoriaNome: "Perfume", quantidade: 2, valorUnitario: 25, tipoItem: "DECANT", volumeMl: 5 }],
      }], totalPages: 2 } });

    const result = await salesHistoryRepository.listSales();

    expect(apiClientGetMock).toHaveBeenNthCalledWith(2, "/vendas", { params: { page: 1, size: 100 } });
    expect(result[1]).toEqual(expect.objectContaining({
      id: "V-20",
      cancelada: true,
      itens: [expect.objectContaining({ nome: "Sauvage", categoria: "Perfume", tipoItem: "DECANT", volume: "5ml" })],
    }));
  });

  it("loads detail by numeric ID and patches status and payment", async () => {
    apiClientGetMock.mockResolvedValue({ data: { ...saleDto, itens: [] } });
    apiClientPatchMock.mockResolvedValue({ data: { ...saleDto, status: "CANCELADA" } });

    await salesHistoryRepository.getSaleDetails("V-19");
    await salesHistoryRepository.updateSale({
      id: "V-19",
      data: "08/04/2026",
      cliente: "Maria Silva",
      pagamento: "Cartão de crédito",
      total: 705,
      tipoVenda: "online",
      cancelada: true,
      itens: [],
    });

    expect(apiClientGetMock).toHaveBeenCalledWith("/vendas/19");
    expect(apiClientPatchMock).toHaveBeenCalledWith("/vendas/19", {
      status: "CANCELADA",
      tipoPagamento: "CARTAO_CREDITO",
    });
    expect(apiClientDeleteMock).not.toHaveBeenCalled();
  });

  it.each(["BR123456789XX", "NOVO123456789"])("persists tracking changes on finalized WhatsApp sales: %s", async codigoRastreio => {
    apiClientGetMock.mockResolvedValue({ data: saleDto });
    apiClientPatchMock.mockResolvedValue({ data: { ...saleDto, codigoRastreio } });
    const sale = await salesHistoryRepository.getSaleDetails("V-19");
    const saved = await salesHistoryRepository.updateSale({ ...sale, codigoRastreio: ` ${codigoRastreio} ` });
    expect(apiClientPatchMock).toHaveBeenCalledWith("/vendas/19", { status: "FINALIZADA", tipoPagamento: "CARTAO_CREDITO", codigoRastreio });
    expect(apiClientDeleteMock).not.toHaveBeenCalled();
    expect(saved.codigoRastreio).toBe(codigoRastreio);
  });

  it("removes tracking without changing finalized status", async () => {
    apiClientGetMock.mockResolvedValue({ data: saleDto });
    apiClientPatchMock.mockResolvedValue({ data: { ...saleDto, codigoRastreio: null } });
    const sale = await salesHistoryRepository.getSaleDetails("V-19");
    const saved = await salesHistoryRepository.updateSale({ ...sale, codigoRastreio: "" });
    expect(apiClientDeleteMock).toHaveBeenCalledWith("/vendas/19/codigo-rastreio");
    expect(apiClientPatchMock).toHaveBeenCalledWith("/vendas/19", { status: "FINALIZADA", tipoPagamento: "CARTAO_CREDITO" });
    expect(saved).toMatchObject({ enviado: true, codigoRastreio: undefined });
  });

  it("clears WhatsApp tracking when returning a finalized sale to pending", async () => {
    apiClientPatchMock.mockResolvedValue({ data: { ...saleDto, status: "PENDENTE", codigoRastreio: null } });

    await salesHistoryRepository.updateSale({
      id: "V-19",
      data: "08/04/2026 14:30",
      cliente: "Maria Silva",
      pagamento: "Cartão de crédito",
      total: 705,
      tipoVenda: "online",
      canalOnline: "whatsapp",
      codigoRastreio: "BR123456789XX",
      enviado: false,
      itens: [],
    });

    expect(apiClientPatchMock).toHaveBeenCalledWith("/vendas/19", {
      status: "PENDENTE",
      tipoPagamento: "CARTAO_CREDITO",
    });
    expect(apiClientDeleteMock).toHaveBeenCalledWith("/vendas/19/codigo-rastreio");
    expect(apiClientDeleteMock.mock.invocationCallOrder[0]).toBeLessThan(apiClientPatchMock.mock.invocationCallOrder[0]);
  });

  it("uses the idempotent tracking DELETE when a pending WhatsApp sale has no code in the list response", async () => {
    apiClientPatchMock.mockResolvedValue({ data: { ...saleDto, status: "PENDENTE", codigoRastreio: null } });

    await salesHistoryRepository.updateSale({
      id: "V-19",
      data: "08/04/2026 14:30",
      cliente: "Maria Silva",
      pagamento: "Cartão de crédito",
      total: 705,
      tipoVenda: "online",
      canalOnline: "whatsapp",
      enviado: false,
      itens: [],
    });

    expect(apiClientDeleteMock).toHaveBeenCalledWith("/vendas/19/codigo-rastreio");
  });

  it("does not change status if removing the tracking code fails", async () => {
    apiClientDeleteMock.mockRejectedValueOnce(new Error("TRACKING_DELETE_FAILED"));

    await expect(salesHistoryRepository.updateSale({
      id: "V-19",
      data: "08/04/2026 14:30",
      cliente: "Maria Silva",
      pagamento: "Pix",
      total: 705,
      tipoVenda: "online",
      canalOnline: "whatsapp",
      codigoRastreio: "BR123456789XX",
      enviado: false,
      itens: [],
    })).rejects.toThrow("TRACKING_DELETE_FAILED");

    expect(apiClientPatchMock).not.toHaveBeenCalled();
  });

  it("removes WhatsApp tracking before cancelling a finalized sale", async () => {
    apiClientDeleteMock.mockResolvedValueOnce({});
    apiClientPatchMock.mockResolvedValueOnce({ data: { ...saleDto, status: "CANCELADA", codigoRastreio: null } });

    const result = await salesHistoryRepository.updateSale({
      id: "V-19",
      data: "08/04/2026 14:30",
      cliente: "Maria Silva",
      pagamento: "Pix",
      total: 705,
      tipoVenda: "online",
      canalOnline: "whatsapp",
      codigoRastreio: "BR123456789XX",
      cancelada: true,
      enviado: true,
      itens: [],
    });

    expect(apiClientDeleteMock.mock.invocationCallOrder[0]).toBeLessThan(apiClientPatchMock.mock.invocationCallOrder[0]);
    expect(apiClientPatchMock).toHaveBeenCalledWith("/vendas/19", { status: "CANCELADA", tipoPagamento: "PIX" });
    expect(result).toMatchObject({ cancelada: true, codigoRastreio: undefined });
  });
});