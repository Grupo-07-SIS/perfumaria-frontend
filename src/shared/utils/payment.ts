const paymentLabels: Record<string, string> = {
  CARTAO_CREDITO: "Cart\u00e3o de cr\u00e9dito",
  CARTAO_DEBITO: "Cart\u00e3o de d\u00e9bito",
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  TRANSFERENCIA_BANCARIA: "Transfer\u00eancia banc\u00e1ria",
};

export function formatPaymentLabel(value?: string | null): string {
  if (!value) return "";
  const normalized = value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").replace("_DE_", "_");
  return paymentLabels[normalized] ?? value.trim();
}