import { calculateSaleTotals, createSaleCustomer, fetchSalesData, registerSale, salesErrorMessage, validateSale } from "../services/sales.service";
import { useForm } from "react-hook-form";
import type { SalesFormValues, CatalogItem, CartItem, SaleCustomer, NovoClienteModalFormValues } from "../models/sales.models";
import { useEffect, useRef, useState } from "react";
export function useSalesFacade() {
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [clientes, setClientes] = useState<SaleCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    fetchSalesData().then(data => {
      if (!active) return;
      setProducts(data.products);
      setClientes(data.customers);
    }).catch(error => {
      if (active) setLoadError(salesErrorMessage(error, "Não foi possível carregar os produtos e clientes."));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [reloadKey]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteSelected, setClienteSelected] = useState<SaleCustomer | null>(null);
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
  const setPagamento = (value: string) => form.setValue("pagamento", value, { shouldDirty: true });
  const setIsOnline = (value: boolean) => form.setValue("isOnline", value, { shouldDirty: true });
  const setCanalOnline = (value: SalesFormValues["canalOnline"]) => form.setValue("canalOnline", value, { shouldDirty: true });
  const setTipoDesconto = (value: SalesFormValues["tipoDesconto"]) => form.setValue("tipoDesconto", value, { shouldDirty: true });
  const setDesconto = (value: string) => form.setValue("desconto", value, { shouldDirty: true });
  const setFrete = (value: string) => form.setValue("frete", value, { shouldDirty: true });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const clientesFiltrados = clientes.filter(c => {
    const query = clienteSearch.toLowerCase();
    return c.nome.toLowerCase().includes(query) || c.telefone.includes(query) || c.email.toLowerCase().includes(query);
  });
  const catalogoFiltrado = products.filter(product => product.nome.toLowerCase().includes(itemSearch.toLowerCase()));
  const addToCart = (item: CatalogItem) => {
    setSuccess(false);
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
  const handleRegistrar = async () => {
    if (submitting.current || loading || loadError) return;
    setSuccess(false);
    const values = form.getValues();
    const errs = validateSale(cart, clienteSelected, values);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    submitting.current = true;
    setSaving(true);
    try {
      await registerSale(cart, clienteSelected, values);
      setSuccess(true);
      setCart([]);
      setClienteSelected(null);
      setClienteSearch("");
      setItemSearch("");
      setItemOpen(false);
      setClienteOpen(false);
      form.reset();
    } catch (error) {
      setErrors([salesErrorMessage(error, "Não foi possível confirmar o registro. Verifique as vendas antes de tentar novamente.")]);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const displayLabel = (c: {
    nome: string;
    telefone: string;
  }) => `${c.nome} – ${c.telefone}`;
  const createCustomer = async (values: NovoClienteModalFormValues) => {
    const novoCliente = await createSaleCustomer(values);
    setClientes(prev => [...prev, novoCliente]);
    setClienteSelected(novoCliente);
    setClienteSearch("");
    setClienteOpen(false);
  };
  return {
    loading,
    loadError,
    saving,
    reload: () => setReloadKey(previous => previous + 1),
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
    handleRegistrar,
    displayLabel,
    createCustomer
  };
}
