import type { Period } from "../models/dashboard.models";





export const PIE_COLORS = ["#c29958", "#1a1a1a", "#6b6b68", "#d4b278", "#eeeeec"];





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
