import type { NovoClienteModalFormValues, CartItem, SalesFormValues } from "../models/sales.models";
export function calculateSaleTotals({
  cart,
  isOnline,
  frete,
  tipoDesconto,
  desconto
}: Pick<SalesFormValues, "isOnline" | "frete" | "tipoDesconto" | "desconto"> & {
  cart: CartItem[];
}) {
  const subtotal = cart.reduce((acc, i) => acc + i.catalogItem.preco * i.quantidade, 0);
  const freteVal = isOnline && frete ? parseFloat(frete) : 0;
  const descontoNum = desconto ? parseFloat(desconto) : 0;
  const descontoValor = tipoDesconto === "percentual" ? subtotal * descontoNum / 100 : descontoNum;
  const descontoAplicado = Math.min(descontoValor, subtotal);
  const total = Math.max(0, subtotal - descontoAplicado + freteVal);
  return {
    subtotal,
    freteVal,
    descontoNum,
    descontoValor,
    descontoAplicado,
    total
  };
}
export function validateNovoCliente({
  nome,
  telefone
}: Pick<NovoClienteModalFormValues, "nome" | "telefone">) {
  const errors: Record<string, string> = {};
  if (!nome.trim()) errors.nome = "Obrigatório.";
  if (!telefone.trim()) errors.telefone = "Obrigatório.";
  return errors;
}
