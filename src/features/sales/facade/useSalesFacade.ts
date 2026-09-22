import { calculateSaleTotals } from "../services/sales.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { SalesFormValues, CatalogItem, CartItem } from "../models/sales.models";
import { useSalesRepository, decants, triggerBotpressPresencialFlow } from "../repository/sales.repository";
import { useState } from "react";
export function useSalesFacade() {
  const {
    clientes,
    products,
    reduceStock,
    addVenda,
    setClientes
  } = useSalesRepository();
  const catalogProdutos: CatalogItem[] = products.map(p => ({
    id: p.id,
    nome: p.name,
    preco: p.preco,
    tipo: "produto" as const,
    productContextId: p.id
  }));
  const catalogo = [...catalogProdutos, ...decants];
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteSelected, setClienteSelected] = useState<{
    id: number;
    nome: string;
    telefone: string;
    email: string;
  } | null>(null);
  const [clienteOpen, setClienteOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemOpen, setItemOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const form = useForm<SalesFormValues>({
    defaultValues: {
      pagamento: "",
      isOnline: false,
      canalOnline: null,
      frete: "",
      tipoDesconto: "percentual",
      desconto: ""
    }
  });
  const {
    pagamento,
    isOnline,
    canalOnline,
    frete,
    tipoDesconto,
    desconto
  } = form.watch();
  const setPagamento = (value: SetStateAction<SalesFormValues["pagamento"]>) => form.setValue("pagamento", typeof value === "function" ? value(form.getValues("pagamento")) : value, {
    shouldDirty: true
  });
  const setIsOnline = (value: SetStateAction<SalesFormValues["isOnline"]>) => form.setValue("isOnline", typeof value === "function" ? value(form.getValues("isOnline")) : value, {
    shouldDirty: true
  });
  const setCanalOnline = (value: SetStateAction<SalesFormValues["canalOnline"]>) => form.setValue("canalOnline", typeof value === "function" ? value(form.getValues("canalOnline")) : value, {
    shouldDirty: true
  });
  const setFrete = (value: SetStateAction<SalesFormValues["frete"]>) => form.setValue("frete", typeof value === "function" ? value(form.getValues("frete")) : value, {
    shouldDirty: true
  });
  const setTipoDesconto = (value: SetStateAction<SalesFormValues["tipoDesconto"]>) => form.setValue("tipoDesconto", typeof value === "function" ? value(form.getValues("tipoDesconto")) : value, {
    shouldDirty: true
  });
  const setDesconto = (value: SetStateAction<SalesFormValues["desconto"]>) => form.setValue("desconto", typeof value === "function" ? value(form.getValues("desconto")) : value, {
    shouldDirty: true
  });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const clientesFiltrados = clientes.filter(c => {
    if (c.ativo === false) return false;
    const query = clienteSearch.toLowerCase();
    return c.nome.toLowerCase().includes(query) || c.telefone.includes(query) || c.email.toLowerCase().includes(query);
  });
  const catalogoFiltrado = catalogo.filter(p => p.nome.toLowerCase().includes(itemSearch.toLowerCase()));
  const addToCart = (item: CatalogItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.catalogItem.id === item.id);
      if (existing) return prev.map(i => i.catalogItem.id === item.id ? {
        ...i,
        quantidade: i.quantidade + 1
      } : i);
      return [...prev, {
        catalogItem: item,
        quantidade: 1
      }];
    });
    setItemSearch("");
    setItemOpen(false);
  };
  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setCart(prev => prev.map(i => i.catalogItem.id === id ? {
      ...i,
      quantidade: qty
    } : i));
  };
  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.catalogItem.id !== id));
  const {
    subtotal,
    freteVal,
    descontoNum,
    descontoValor,
    descontoAplicado,
    total
  } = calculateSaleTotals({
    cart,
    isOnline,
    frete,
    tipoDesconto,
    desconto
  });
  const handleFinalizar = async () => {
    const errs: string[] = [];
    if (cart.length === 0) errs.push("Adicione pelo menos um item ao carrinho.");
    if (!clienteSelected) errs.push("Selecione um cliente. O vínculo com cliente é obrigatório.");
    if (!pagamento) errs.push("Selecione o tipo de pagamento.");
    if (isOnline && !canalOnline) errs.push("Selecione o canal da venda online (WhatsApp ou Site).");
    if (isOnline && (!frete || parseFloat(frete) < 0)) errs.push("Informe o valor do frete para venda online.");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    const stockReductions = cart.filter(i => i.catalogItem.productContextId !== undefined).map(i => ({
      productId: i.catalogItem.productContextId!,
      qty: i.quantidade
    }));
    if (stockReductions.length > 0) reduceStock(stockReductions);
    const freteValFinal = isOnline && frete ? parseFloat(frete) : undefined;
    const now = new Date();
    const dataFormatada = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const vendaItens = cart.map(i => ({
      nome: i.catalogItem.nome,
      volume: i.catalogItem.volume,
      quantidade: i.quantidade,
      valorUnitario: i.catalogItem.preco
    }));
    const vendaId = addVenda({
      data: dataFormatada,
      cliente: clienteSelected?.nome ?? "",
      emailCliente: clienteSelected?.email || undefined,
      pagamento,
      tipoVenda: isOnline ? "online" : "presencial",
      canalOnline: isOnline ? canalOnline ?? undefined : undefined,
      frete: freteValFinal,
      desconto: descontoAplicado > 0 ? descontoAplicado : undefined,
      total,
      itens: vendaItens,
      enviado: false
    });

    // Dispara fluxo Botpress para vendas presenciais
    if (!isOnline && clienteSelected) {
      try {
        const subtotalVenda = subtotal;
        const freteVenda = 0;
        await triggerBotpressPresencialFlow({
          codigoVenda: vendaId,
          nomeCliente: clienteSelected.nome,
          emailCliente: clienteSelected.email || undefined,
          dadosPedido: vendaItens.map(item => ({
            ...item,
            totalItem: item.valorUnitario * item.quantidade
          })),
          frete: freteVenda,
          desconto: descontoAplicado > 0 ? descontoAplicado : undefined,
          subtotal: subtotalVenda,
          totalVenda: total,
          formaPagamento: pagamento,
          dataHoraPedido: dataFormatada,
          canalVenda: "presencial",
          codigoRastreio: undefined
        });
      } catch (error) {
        console.error("Erro ao acionar fluxo do Botpress", error);
      }
    }
    setSuccess(true);
    setCart([]);
    setClienteSelected(null);
    setClienteSearch("");
    setPagamento("");
    setIsOnline(false);
    setCanalOnline(null);
    setFrete("");
    setDesconto("");
    setTimeout(() => setSuccess(false), 3500);
  };
  const displayLabel = (c: {
    nome: string;
    telefone: string;
  }) => `${c.nome} – ${c.telefone}`;
  const createCustomer = (nome: string, telefone: string) => {
    const newId = Math.max(...clientes.map(c => c.id), 0) + 1;
    const novoCliente = {
      id: newId,
      nome,
      email: "",
      telefone,
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        uf: ""
      },
      totalPedidos: 0,
      ativo: true
    };
    setClientes(prev => [...prev, novoCliente]);
    setClienteSelected({
      id: newId,
      nome,
      telefone,
      email: ""
    });
    setClienteSearch("");
    setClienteOpen(false);
  };
  return {
    clientes,
    products,
    reduceStock,
    addVenda,
    setClientes,
    catalogProdutos,
    catalogo,
    clienteSearch,
    setClienteSearch,
    clienteSelected,
    setClienteSelected,
    clienteOpen,
    setClienteOpen,
    itemSearch,
    setItemSearch,
    itemOpen,
    setItemOpen,
    cart,
    setCart,
    pagamento,
    setPagamento,
    isOnline,
    setIsOnline,
    canalOnline,
    setCanalOnline,
    frete,
    setFrete,
    tipoDesconto,
    setTipoDesconto,
    desconto,
    setDesconto,
    success,
    setSuccess,
    errors,
    setErrors,
    showNovoCliente,
    setShowNovoCliente,
    clientesFiltrados,
    catalogoFiltrado,
    addToCart,
    updateQty,
    removeItem,
    subtotal,
    freteVal,
    descontoNum,
    descontoValor,
    descontoAplicado,
    total,
    handleFinalizar,
    displayLabel,
    createCustomer
  };
}
