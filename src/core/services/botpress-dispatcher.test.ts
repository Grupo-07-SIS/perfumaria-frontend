import { beforeEach, describe, expect, it, vi } from "vitest";

const { axiosIsAxiosErrorMock, axiosPostMock, emitTelemetryMock } = vi.hoisted(() => ({
  axiosIsAxiosErrorMock: vi.fn((error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError)),
  axiosPostMock: vi.fn(),
  emitTelemetryMock: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: axiosIsAxiosErrorMock,
    post: axiosPostMock,
  },
}));

vi.mock("./botpress-telemetry", () => ({
  emitTelemetry: emitTelemetryMock,
}));

import { dispatchBotpressFlow } from "./botpress-dispatcher";
import type { BotpressSalePayload } from "./botpress-types";

const webhookPath = "/botpress-webhook/b58e54b1-bda7-4a5e-b47b-9308276def9b";

const salePayload: BotpressSalePayload = {
  canalVenda: "site",
  codigoRastreio: "BR123",
  codigoVenda: "VENDA-42",
  dadosPedido: [{ nome: "Chance", quantidade: 2, totalItem: 220, valorUnitario: 110, volume: "100ml" }],
  dataHoraPedido: "2026-09-23T12:00:00.000Z",
  desconto: 10,
  emailCliente: "cliente@example.com",
  formaPagamento: "PIX",
  frete: 15.5,
  nomeCliente: "Cliente Teste",
  subtotal: 220,
  totalVenda: 225.5,
};

describe("dispatchBotpressFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts the normalized event with Axios and reports success telemetry", async () => {
    axiosPostMock.mockResolvedValue({ data: undefined, status: 202 });

    await dispatchBotpressFlow("online", salePayload);

    expect(axiosPostMock).toHaveBeenCalledWith(webhookPath, {
      eventType: "venda_online_finalizada",
      payload: {
        ...salePayload,
        desconto: "10.00",
        dadosPedido: [{ nome: "Chance", quantidade: 2, totalItem: "220.00", valorUnitario: "110.00", volume: "100ml" }],
        frete: "15.50",
        subtotal: "220.00",
        totalVenda: "225.50",
      },
    });
    expect(emitTelemetryMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
      codigoVenda: "VENDA-42",
      eventType: "venda_online_finalizada",
      flow: "online",
      saleChannel: "site",
      type: "request_started",
    }));
    expect(emitTelemetryMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
      codigoVenda: "VENDA-42",
      flow: "online",
      status: 202,
      type: "request_succeeded",
    }));
  });

  it("preserves an Axios HTTP status in telemetry and the public error message", async () => {
    axiosPostMock.mockRejectedValue({
      isAxiosError: true,
      message: "Request failed with status code 503",
      response: { status: 503 },
    });

    await expect(dispatchBotpressFlow("online", salePayload)).rejects.toThrow(
      /^Falha ao acionar Botpress: 503 \(requestId: .+\)$/,
    );

    expect(emitTelemetryMock).toHaveBeenLastCalledWith(expect.objectContaining({
      error: "Falha ao acionar Botpress: 503",
      flow: "online",
      status: 503,
      type: "request_failed",
    }));
  });

  it("preserves network errors and reports failure telemetry without a status", async () => {
    const networkError = new Error("Network Error");
    axiosPostMock.mockRejectedValue(networkError);

    await expect(dispatchBotpressFlow("presencial", salePayload)).rejects.toBe(networkError);

    expect(emitTelemetryMock).toHaveBeenLastCalledWith(expect.objectContaining({
      error: "Network Error",
      eventType: "venda_presencial_finalizada",
      flow: "presencial",
      saleChannel: "presencial",
      type: "request_failed",
    }));
    expect(emitTelemetryMock.mock.calls.at(-1)?.[0]).not.toHaveProperty("status");
  });
});