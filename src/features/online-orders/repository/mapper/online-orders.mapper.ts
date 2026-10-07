import type { Venda } from "../../../../core/store/AppContext";
import type { OnlineOrderDto } from "../dto/online-orders.dto";

const PAYMENT_LABELS: Record<string, string> = {
  CARTAO_CREDITO: "Cartão de crédito",
  CARTAO_DEBITO: "Cartão de débito",
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  TRANSFERENCIA_BANCARIA: "Transferência bancária",
};

function paymentLabel(value?: string | null) {
  if (!value) return "";
  const key = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").replace("_DE_", "_");
  return PAYMENT_LABELS[key] ?? value;
}

function formatDate(dataHora?: string | null, dataVenda?: string | null) {
  const value = dataHora || dataVenda;
  if (!value) return "";
  const [datePart, timePart] = value.split("T");
  const pieces = datePart.split("-");
  if (pieces.length !== 3) return value;
  const date = `${pieces[2]}/${pieces[1]}/${pieces[0]}`;
  return timePart ? `${date} ${timePart.slice(0, 5)}` : date;
}

export function toVenda(dto: OnlineOrderDto): Venda {
  return {
    id: `V-${dto.id}`,
    data: formatDate(dto.dataHora, dto.dataVenda),
    cliente: dto.clienteNome ?? "",
    pagamento: paymentLabel(dto.forma),
    total: dto.valorFinal ?? dto.valorTotal ?? dto.subtotal ?? 0,
    tipoVenda: "online",
    canalOnline: dto.canalVendaOnline?.toLowerCase() as "whatsapp" | "site" | undefined,
    frete: dto.frete ?? undefined,
    desconto: dto.desconto ?? undefined,
    itens: (dto.itens ?? []).map(item => ({
      nome: item.produtoNome,
      volume: item.volumeMl ? `${item.volumeMl}ml` : undefined,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      tipoItem: item.tipoItem ?? undefined,
    })),
    cancelada: dto.status === "CANCELADA",
    enviado: dto.status === "FINALIZADA",
  };
}
