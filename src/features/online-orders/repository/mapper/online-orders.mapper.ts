import type { Venda } from "../../../../core/store/AppContext";
import type { OnlineOrderDto } from "../dto/online-orders.dto";
import { formatPaymentLabel } from "../../../../shared/utils/payment";

function formatDate(dataHoraVenda: string) {
  const value = dataHoraVenda;
  if (!value) return "";
  const [datePart, timePart] = value.split(/[T ]/);
  const pieces = datePart.split("-");
  if (pieces.length !== 3) return value;
  const date = `${pieces[2]}/${pieces[1]}/${pieces[0]}`;
  return timePart ? `${date} ${timePart.slice(0, 5)}` : date;
}

export function toVenda(dto: OnlineOrderDto): Venda {
  return {
    id: `V-${dto.id}`,
    data: formatDate(dto.dataHoraVenda),
    cliente: dto.clienteNome ?? "",
    codigoRastreio: dto.codigoRastreio ?? undefined,
    pagamento: formatPaymentLabel(dto.forma),
    total: dto.valorFinal ?? dto.valorTotal ?? dto.subtotal ?? 0,
    tipoVenda: "online",
    canalOnline: dto.canalVendaOnline?.toLowerCase() as "whatsapp" | "site" | undefined,
    frete: dto.frete ?? undefined,
    desconto: dto.desconto ?? undefined,
    itens: (dto.itens ?? []).map(item => ({
      nome: item.produtoNome,
      categoria: item.categoriaNome ?? undefined,
      volume: item.volumeMl ? `${item.volumeMl}ml` : undefined,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      tipoItem: item.tipoItem ?? undefined,
    })),
    cancelada: dto.status === "CANCELADA",
    enviado: dto.status === "FINALIZADA",
  };
}
