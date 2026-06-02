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
    dadosPedido: BotpressSaleItemPayload[];
    subtotal: number;
    totalVenda: number;
    frete?: number;
    formaPagamento: string;
    dataHoraPedido: string;
    canalVenda: "presencial" | "whatsapp" | "site";
    codigoRastreio?: string;
}

const BOTPRESS_PATH = '/b58e54b1-bda7-4a5e-b47b-9308276def9b';

// Em dev, usa o proxy do Vite para evitar CORS.
// Em produção, usa a URL completa via variável de ambiente.
const botpressWebhookUrl = import.meta.env.DEV
    ? `/botpress-webhook${BOTPRESS_PATH}`
    : import.meta.env.VITE_BOTPRESS_WEBHOOK_URL;

export async function triggerBotpressPresencialFlow(
    payload: BotpressSalePayload,
) {
    if (!botpressWebhookUrl) {
        return;
    }

    const response = await fetch(botpressWebhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            eventType: "venda_presencial_finalizada",
            saleChannel: "presencial",
            payload,
        }),
    });

    if (!response.ok) {
        throw new Error(`Falha ao acionar Botpress: ${response.status}`);
    }
}

export async function triggerBotpressOnlineFlow(
    payload: BotpressSalePayload,
) {
    if (!botpressWebhookUrl) {
        return;
    }

    const response = await fetch(botpressWebhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            eventType: "venda_online_finalizada",
            saleChannel: payload.canalVenda,
            payload,
        }),
    });

    if (!response.ok) {
        throw new Error(`Falha ao acionar Botpress: ${response.status}`);
    }
}