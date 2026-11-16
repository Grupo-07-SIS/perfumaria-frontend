import type { Period, SalesChannel } from "../models/home.models";
export const SALES_CHANNEL_OPTIONS: { value: SalesChannel; label: string }[] = [
  { value: "todos", label: "Todos os canais" },
  { value: "presencial", label: "Presencial" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "site", label: "Site" },
];
export const ACC = "#70243f";
export const DARK = "#050300";
export const WARM = "#f5ede0";
export const PERIOD_LABELS: Record<Period, string> = {
  diario: "Diário",
  "7dias": "7 dias",
  "30dias": "30 dias",
  semestre: "Semestre"
};
export const CAT_COLORS = [ACC, "#a45b76", "#6b4755", "#c57d99"];
export const PRODUCT_RANK_COLORS = [ACC, DARK, "#82344f", "#964762", "#aa5b75"];
export const TOOLTIP_STYLE = {
  contentStyle: {
    background: DARK,
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "12px"
  }
};
