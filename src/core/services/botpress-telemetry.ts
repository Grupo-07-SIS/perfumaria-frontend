import type {
    BotpressTelemetryEvent,
    BotpressTelemetryObserver,
} from "./botpress-types";

const botpressTelemetryObservers = new Set<BotpressTelemetryObserver>();

export function emitTelemetry(event: BotpressTelemetryEvent) {
    for (const observer of botpressTelemetryObservers) {
        try {
            observer(event);
        } catch {
            // Observability nunca deve quebrar o fluxo principal.
        }
    }

    if (import.meta.env.DEV) {
        if (event.type === "request_failed") {
            console.error("[botpress] request_failed", event);
            return;
        }

        console.info(`[botpress] ${event.type}`, event);
    }
}

export function addBotpressTelemetryObserver(observer: BotpressTelemetryObserver) {
    botpressTelemetryObservers.add(observer);

    return () => {
        botpressTelemetryObservers.delete(observer);
    };
}
