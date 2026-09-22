import type { DecantModalFormValues } from "../models/decants.models";

export function validateDecant(values: DecantModalFormValues) {
  if (!values.perfume) return "Selecione um perfume.";
  if (!values.preco2ml || !values.preco3ml || !values.preco5ml || !values.preco10ml) {
    return "Preencha todos os preços.";
  }
  return "";
}

import type { Decant } from "../models/decants.models";

export function exportCSV(decants: Decant[]) {
  const headers = ["ID", "Perfume", "Preço 2ml", "Preço 3ml", "Preço 5ml", "Preço 10ml"];
  const rows = decants.map(d => [d.id, d.perfume, d.preco2ml.toFixed(2), d.preco3ml.toFixed(2), d.preco5ml.toFixed(2), d.preco10ml.toFixed(2)]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tabela-decants.csv";
  a.click();
  URL.revokeObjectURL(url);
}
