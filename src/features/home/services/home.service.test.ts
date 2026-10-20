import { describe, expect, it } from "vitest";
import { brazilianDateToLocalDate, formatBrazilianDate, parseBrazilianDate, selectSalesOverview, selectChannelSales } from "./home.service";
import type { Venda } from "../../../core/store/AppContext";

const sales: Venda[] = [
  { id: "V-1", data: "06/10/2026 14:30", cliente: "A", pagamento: "Pix", total: 80, tipoVenda: "online", itens: [], enviado: true },
  { id: "V-2", data: "05/10/2026 10:00", cliente: "B", pagamento: "Pix", total: 40, tipoVenda: "online", itens: [], enviado: false },
  { id: "V-3", data: "04/10/2026 10:00", cliente: "C", pagamento: "Pix", total: 20, tipoVenda: "presencial", itens: [], cancelada: true },
];

describe("selectChannelSales", () => {
  const data = { presencial: 4, whatsapp: 2, site: 0, previous: { presencial: 2, whatsapp: 4, site: 0 } };
  it.each([
    ["todos", 6, 0], ["presencial", 4, 100], ["whatsapp", 2, -50], ["site", 0, 0],
  ] as const)("compara o canal %s com o mesmo canal anterior", (channel, count, change) => {
    expect(selectChannelSales(data, channel)).toEqual({ count, change });
  });

  it("considera crescimento a partir de zero e queda a zero", () => {
    expect(selectChannelSales({ ...data, site: 3 }, "site")).toEqual({ count: 3, change: 100 });
    expect(selectChannelSales({ ...data, whatsapp: 0 }, "whatsapp")).toEqual({ count: 0, change: -100 });
  });

  it("nao inventa percentual quando o periodo anterior esta indisponivel", () => {
    expect(selectChannelSales({ ...data, previous: null }, "presencial")).toEqual({ count: 4, change: undefined });
  });
});

describe("selectSalesOverview", () => {
  it("aggregates selected-period sales and revenue while excluding cancelled sales", () => {
    const result = selectSalesOverview(sales, "7dias", new Date(2026, 9, 7));

    expect(result.totalSales).toBe(2);
    expect(result.revenue).toBe(80);
    expect(result.chartData.reduce((sum, point) => sum + point.vendas, 0)).toBe(2);
    expect(result.chartData.reduce((sum, point) => sum + point.faturamento, 0)).toBe(80);
    expect(result.recentSales.map(sale => sale.id)).toEqual(["V-1", "V-2"]);
  });

  it("creates six monthly chart buckets for the semester", () => {
    const result = selectSalesOverview(sales, "semestre", new Date(2026, 9, 7));

    expect(result.chartData).toHaveLength(6);
    expect(result.chartData[0].label).toMatch(/mai/i);
    expect(result.chartData.at(-1)?.label).toMatch(/out/i);
  });
});

describe("Brazilian dashboard dates", () => {
  it.each(["31/02/2026", "29/02/2025", "00/10/2026", "12/13/2026", "1/10/2026", "29/02/20x4"])("rejects invalid calendar date %s", value => {
    expect(parseBrazilianDate(value)).toBeNull();
    expect(brazilianDateToLocalDate(value)).toBeUndefined();
  });

  it("accepts leap days and converts dates without shifting the local day", () => {
    expect(parseBrazilianDate("29/02/2024")).toBe("2024-02-29");
    expect(formatBrazilianDate(brazilianDateToLocalDate("29/02/2024"))).toBe("29/02/2024");
  });
});