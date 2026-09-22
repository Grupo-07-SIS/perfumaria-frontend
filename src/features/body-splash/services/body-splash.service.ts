import type { BodySplashModalFormValues, BodySplashItem } from "../models/body-splash.models";
import { VOLUMES } from "../config/body-splash.config";
export function validateBodySplash({
  produto,
  precos
}: BodySplashModalFormValues) {
  if (!produto) return "Selecione um Body Splash.";
  if (!VOLUMES.every(volume => precos[volume.key] && parseFloat(precos[volume.key]) > 0)) {
    return "Preencha todos os preços.";
  }
  return "";
}
export function exportCSV(items: BodySplashItem[]) {
  const headers = ["ID", "Body Splash", "10ml", "15ml", "20ml", "25ml", "30ml"];
  const rows = items.map(d => [d.id, d.produto, d.preco10ml.toFixed(2), d.preco15ml.toFixed(2), d.preco20ml.toFixed(2), d.preco25ml.toFixed(2), d.preco30ml.toFixed(2)]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tabela-bodysplash.csv";
  a.click();
  URL.revokeObjectURL(url);
}
