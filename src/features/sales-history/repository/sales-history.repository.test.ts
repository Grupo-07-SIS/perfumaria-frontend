import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientGetMock, apiClientPatchMock } = vi.hoisted(() => ({
  apiClientGetMock: vi.fn(),
  apiClientPatchMock: vi.fn(),
}));

vi.mock("../../../core/services/http-client", () => ({
  apiClient: {
    get: apiClientGetMock,
    patch: apiClientPatchMock,
  },
}));

import { salesHistoryRepository } from "./sales-history.repository";

const saleDto = {
  id: 19,
  clienteNome: "Maria Silva",
  dataVenda: "2026-04-08",
  dataHora: "2026-04-08T14:30:00",
  status: "FINALIZADA" as const,
  tipoVenda: "ONLINE" as const,
  canalVendaOnline: "WHATSAPP" as const,
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
        itens: [{ produtoNome: "Sauvage", quantidade: 2, valorUnitario: 25, tipoItem: "DECANT", volumeMl: 5 }],
      }], totalPages: 2 } });

    const result = await salesHistoryRepository.listSales();

    expect(apiClientGetMock).toHaveBeenNthCalledWith(2, "/vendas", { params: { page: 1, size: 100 } });
    expect(result[1]).toEqual(expect.objectContaining({
      id: "V-20",
      cancelada: true,
      itens: [expect.objectContaining({ nome: "Sauvage", tipoItem: "DECANT", volume: "5ml" })],
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
  });
});