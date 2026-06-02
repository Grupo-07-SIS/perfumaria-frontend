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

export async function dispatchBotpressFlow(
    flow: BotpressFlowType,
    payload: BotpressSalePayload,
) {
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

    let response: Response;

    try {
        response = await fetch(botpressWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventType: strategy.eventType,
                saleChannel,
                payload,
            }),
        });
    } catch (error) {
        const durationMs = nowMs() - startMs;
        const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido ao acionar Botpress";

        emitTelemetry({
            type: "request_failed",
            requestId,
            flow,
            eventType: strategy.eventType,
            saleChannel,
            durationMs,
            error: errorMessage,
            timestamp: new Date().toISOString(),
            codigoVenda: payload.codigoVenda,
        });

        throw error;
    }

    const durationMs = nowMs() - startMs;

    if (!response.ok) {
        emitTelemetry({
            type: "request_failed",
            requestId,
            flow,
            eventType: strategy.eventType,
            saleChannel,
            status: response.status,
            durationMs,
            error: `Falha ao acionar Botpress: ${response.status}`,
            timestamp: new Date().toISOString(),
            codigoVenda: payload.codigoVenda,
        });

        throw new Error(
            `Falha ao acionar Botpress: ${response.status} (requestId: ${requestId})`,
        );
    }

    emitTelemetry({
        type: "request_succeeded",
        requestId,
        flow,
        eventType: strategy.eventType,
        saleChannel,
        status: response.status,
        durationMs,
        timestamp: new Date().toISOString(),
        codigoVenda: payload.codigoVenda,
    });
}
