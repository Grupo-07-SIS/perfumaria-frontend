import type { Period } from "../models/dashboard.models";
export const PIE_COLORS = ["#70243f", "#a45b76", "#6b4755", "#c57d99", "#eadce1"];
export const periodLabels: Record<Period, string> = {
  hoje: "Hoje",
  "7dias": "Últimos 7 dias",
  "30dias": "Últimos 30 dias"
};
export const tooltipStyle = {
  background: "#1a1a1a",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontSize: "12px"
};
export const axisProps = {
  fontSize: 11,
  fill: "#9ca3af"
};
