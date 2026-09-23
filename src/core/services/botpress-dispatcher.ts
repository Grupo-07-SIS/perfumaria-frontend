import axios from "axios";
import { flowStrategyRegistry } from "./botpress-strategies";
import { emitTelemetry } from "./botpress-telemetry";
import type { BotpressFlowType, BotpressSalePayload } from "./botpress-types";

const BOTPRESS_PATH = "/b58e54b1-bda7-4a5e-b47b-9308276def9b";

const botpressWebhookUrl = import.meta.env.DEV
    ? `/botpress-webhook${BOTPRESS_PATH}`
    : import.meta.env.VITE_BOTPRESS_WEBHOOK_URL;

function generateRequestId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `botpress-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowMs() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/** Formata um valor monetário como string com exatamente duas casas decimais. */
function money(value: number): string {
    return (Math.round(value * 100) / 100).toFixed(2);
}

/**
 * Normaliza o payload para envio ao Botpress.
 * Campos monetários são convertidos para strings com duas casas decimais
 * (ex: "3.50", "220.00") para preservar a formatação no JSON.
 */
function buildBotpressBody(raw: BotpressSalePayload) {
    return {
        codigoVenda: raw.codigoVenda,
        nomeCliente: raw.nomeCliente,
        emailCliente: raw.emailCliente,
        dadosPedido: raw.dadosPedido.map((item) => ({
            nome: item.nome,
            ...(item.volume != null ? { volume: item.volume } : {}),
            quantidade: item.quantidade,
            valorUnitario: money(item.valorUnitario),
            totalItem: money(item.totalItem),
        })),
        frete: raw.frete != null ? money(raw.frete) : undefined,
        desconto: raw.desconto != null ? money(raw.desconto) : undefined,
        subtotal: money(raw.subtotal),
        totalVenda: money(raw.totalVenda),
        formaPagamento: raw.formaPagamento,
        dataHoraPedido: raw.dataHoraPedido,
        canalVenda: raw.canalVenda,
        codigoRastreio: raw.codigoRastreio,
    };
}

export async function dispatchBotpressFlow(
    flow: BotpressFlowType,
    rawPayload: BotpressSalePayload,
) {
    const payload = rawPayload;
    const normalizedPayload = buildBotpressBody(rawPayload);
    const requestId = generateRequestId();
    const timestamp = new Date().toISOString();

    if (!botpressWebhookUrl) {
        emitTelemetry({
            type: "request_skipped",
            requestId,
            flow,
            reason: "missing_webhook_url",
            timestamp,
            codigoVenda: payload.codigoVenda,
        });
        return;
    }

    const strategy = flowStrategyRegistry[flow];
    const saleChannel = strategy.resolveSaleChannel(payload);
    const startMs = nowMs();

    emitTelemetry({
        type: "request_started",
        requestId,
        flow,
        eventType: strategy.eventType,
        saleChannel,
        timestamp,
        codigoVenda: payload.codigoVenda,
    });

    try {
        const response = await axios.post(botpressWebhookUrl, {
            eventType: strategy.eventType,
            payload: normalizedPayload,
        });

        emitTelemetry({
            type: "request_succeeded",
            requestId,
            flow,
            eventType: strategy.eventType,
            saleChannel,
            status: response.status,
            durationMs: nowMs() - startMs,
            timestamp: new Date().toISOString(),
            codigoVenda: payload.codigoVenda,
        });
    } catch (error) {
        const durationMs = nowMs() - startMs;
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const errorMessage = status
            ? `Falha ao acionar Botpress: ${status}`
            : error instanceof Error
              ? error.message
              : "Erro desconhecido ao acionar Botpress";

        emitTelemetry({
            type: "request_failed",
            requestId,
            flow,
            eventType: strategy.eventType,
            saleChannel,
            ...(status !== undefined ? { status } : {}),
            durationMs,
            error: errorMessage,
            timestamp: new Date().toISOString(),
            codigoVenda: payload.codigoVenda,
        });

        if (status) {
            throw new Error(`${errorMessage} (requestId: ${requestId})`);
        }

        throw error;
    }
}
