export interface BotpressSaleItemPayload {
    nome: string;
    volume?: string;
    quantidade: number;
    valorUnitario: number;
    totalItem: number;
}

export interface BotpressSalePayload {
    codigoVenda?: string;
    nomeCliente: string;
    emailCliente?: string;
    dadosPedido: BotpressSaleItemPayload[];
    frete?: number;
    desconto?: number;
    subtotal: number;
    totalVenda: number;
    formaPagamento: string;
    dataHoraPedido: string;
    canalVenda: "presencial" | "whatsapp" | "site";
    codigoRastreio?: string;
}

export type BotpressFlowType = "presencial" | "online";

export type BotpressEventType =
    | "venda_presencial_finalizada"
    | "venda_online_finalizada";

export interface BotpressFlowStrategy {
    flow: BotpressFlowType;
    eventType: BotpressEventType;
    resolveSaleChannel: (
        payload: BotpressSalePayload,
    ) => BotpressSalePayload["canalVenda"];
}

export type BotpressTelemetryEventType =
    | "request_started"
    | "request_succeeded"
    | "request_failed"
    | "request_skipped";

export interface BotpressTelemetryEvent {
    type: BotpressTelemetryEventType;
    requestId: string;
    flow: BotpressFlowType;
    eventType?: BotpressEventType;
    saleChannel?: BotpressSalePayload["canalVenda"];
    status?: number;
    durationMs?: number;
    error?: string;
    reason?: "missing_webhook_url";
    timestamp: string;
    codigoVenda?: string;
}

export type BotpressTelemetryObserver = (
    event: BotpressTelemetryEvent,
) => void;
