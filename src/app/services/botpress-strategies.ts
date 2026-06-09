import type {
    BotpressFlowStrategy,
    BotpressFlowType,
} from "./botpress-types";

export const flowStrategyRegistry: Record<BotpressFlowType, BotpressFlowStrategy> = {
    presencial: {
        flow: "presencial",
        eventType: "venda_presencial_finalizada",
        resolveSaleChannel: () => "presencial",
    },
    online: {
        flow: "online",
        eventType: "venda_online_finalizada",
        resolveSaleChannel: (payload) => payload.canalVenda,
    },
};
