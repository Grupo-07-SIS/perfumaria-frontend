import type { Period, SalesChannel } from "../models/home.models";
export const SALES_CHANNEL_OPTIONS: { value: SalesChannel; label: string }[] = [
  { value: "todos", label: "Todos os canais" },
  { value: "presencial", label: "Presencial" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "site", label: "Site" },
];
export const ACC = "#c29958";
export const DARK = "#050300";
export const WARM = "#f5ede0";
export const PERIOD_LABELS: Record<Period, string> = {
  diario: "Diário",
  "7dias": "7 dias",
  "30dias": "30 dias",
  semestre: "Semestre"
};
export const CAT_COLORS = [ACC, "#b07d40", "#8c6030", "#6b4620"];
export const TOOLTIP_STYLE = {
  contentStyle: {
    background: DARK,
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "12px"
  }
};
