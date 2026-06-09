import { dispatchBotpressFlow } from "./botpress-dispatcher";
import type { BotpressSalePayload } from "./botpress-types";

export { addBotpressTelemetryObserver } from "./botpress-telemetry";
export type {
    BotpressFlowType,
    BotpressSaleItemPayload,
    BotpressSalePayload,
    BotpressTelemetryEvent,
    BotpressTelemetryEventType,
    BotpressTelemetryObserver,
} from "./botpress-types";

export async function triggerBotpressPresencialFlow(
    payload: BotpressSalePayload,
) {
    await dispatchBotpressFlow("presencial", payload);
}

export async function triggerBotpressOnlineFlow(
    payload: BotpressSalePayload,
) {
    await dispatchBotpressFlow("online", payload);
}
