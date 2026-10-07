import { apiClient } from "../../../core/services/http-client";
import type { Venda } from "../../../core/store/AppContext";
import type { OnlineOrderDto, OnlineOrderStatus } from "./dto/online-orders.dto";
import { toVenda } from "./mapper/online-orders.mapper";

interface OrdersPageDto {
  content: OnlineOrderDto[];
  totalPages?: number;
}

const PAGE_SIZE = 100;

function getNumericId(id: string) {
  const numericId = Number(id.replace(/^V-/i, ""));
  if (!Number.isInteger(numericId) || numericId <= 0) throw new Error("ONLINE_ORDERS_INVALID_ID");
  return numericId;
}

export const onlineOrdersRepository = {
  async listOnlineOrders(): Promise<Venda[]> {
    const orders = new Map<number, OnlineOrderDto>();
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const { data } = await apiClient.get<OnlineOrderDto[] | OrdersPageDto>("/vendas", { params: { page, size: PAGE_SIZE } });
      const content = Array.isArray(data) ? data : data.content;
      const previousCount = orders.size;
      content.forEach(order => orders.set(order.id, order));
      hasMore = Array.isArray(data) ? content.length === PAGE_SIZE && orders.size > previousCount : page + 1 < (data.totalPages ?? 1);
      page += 1;
    }
    return [...orders.values()].filter(order => order.tipoVenda === "ONLINE").map(toVenda);
  },

  async getOrder(id: string): Promise<Venda> {
    const { data } = await apiClient.get<OnlineOrderDto>(`/vendas/${getNumericId(id)}`);
    return toVenda(data);
  },

  async updateStatus(id: string, status: OnlineOrderStatus): Promise<Venda> {
    const { data } = await apiClient.patch<OnlineOrderDto>(`/vendas/${getNumericId(id)}`, { status });
    return toVenda(data);
  },
};

export { triggerBotpressOnlineFlow } from "../../../core/services/botpress";
