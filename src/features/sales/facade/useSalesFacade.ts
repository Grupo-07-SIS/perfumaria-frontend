import { calculateSaleTotals, cartQuantityError, createSaleCustomer, fetchSalesData, groupSaleItems, registerSale, salesErrorMessage, searchSaleItems, validateSale } from "../services/sales.service";
import { useForm } from "react-hook-form";
import type { SalesFormValues, CatalogItem, CartItem, SaleItemGroup, SaleCustomer, SaleReview, NovoClienteModalFormValues } from "../models/sales.models";
import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
export function useSalesFacade() {
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [clientes, setClientes] = useState<SaleCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saleReview, setSaleReview] = useState<SaleReview | null>(null);
  const [confirmationError, setConfirmationError] = useState("");
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
  const [selectedBase, setSelectedBase] = useState<SaleItemGroup | null>(null);
  const itemForm = useForm<{ apresentacao: "completo" | "fracionado"; itemId: string }>({
    defaultValues: { apresentacao: "completo", itemId: "" },
  });
  const { apresentacao: itemPresentation, itemId: selectedVariantId } = itemForm.watch();
  const [itemResults, setItemResults] = useState<{ query: string; items: CatalogItem[] } | null>(null);
  const [itemSearchLoading, setItemSearchLoading] = useState(false);
  const [itemSearchError, setItemSearchError] = useState("");
  const debouncedItemSearch = useDebouncedValue(itemSearch.trim());
  useEffect(() => {
    let active = true;
    setItemSearchError("");
    if (!debouncedItemSearch) {
      setItemResults(null);
      setItemSearchLoading(false);
      return;
    }
    setItemSearchLoading(true);
    searchSaleItems(debouncedItemSearch, products).then(items => {
      if (active) setItemResults({ query: debouncedItemSearch, items });
    }).catch(error => {
      if (active) setItemSearchError(salesErrorMessage(error, "Não foi possível buscar os itens da venda."));
    }).finally(() => {
      if (active) setItemSearchLoading(false);
    });
    return () => { active = false; };
  }, [debouncedItemSearch, products]);
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
  const [registeredStatus, setRegisteredStatus] = useState<"FINALIZADA" | "PENDENTE">("FINALIZADA");
  const [errors, setErrors] = useState<string[]>([]);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const clientesFiltrados = clientes.filter(c => {
    const query = clienteSearch.toLowerCase();
    return c.nome.toLowerCase().includes(query) || c.telefone.includes(query) || c.email.toLowerCase().includes(query);
  });
  const catalogoFiltrado = itemResults?.query === itemSearch.trim()
    ? itemResults.items
    : products.filter(product => product.nome.toLowerCase().includes(itemSearch.toLowerCase()));
  const itemGroups = groupSaleItems(catalogoFiltrado, products);
  const selectedGroup = selectedBase ? itemGroups.find(group => group.key === selectedBase.key) ?? selectedBase : null;
  const selectedItem = itemPresentation === "completo"
    ? selectedGroup?.items.find(item => item.tipo === "produto")
    : selectedGroup?.items.find(item => item.tipo !== "produto" && String(item.id) === selectedVariantId);
  const canAddSelectedItem = !!selectedItem && !cartQuantityError(selectedItem,
    (cart.find(item => item.catalogItem.id === selectedItem.id)?.quantidade ?? 0) + 1);
  const selectItemGroup = (group: SaleItemGroup) => {
    setSelectedBase(group);
    setItemSearch(group.nome);
    setItemOpen(false);
    itemForm.reset({ apresentacao: group.items.some(item => item.tipo === "produto") ? "completo" : "fracionado", itemId: "" });
  };
  const setItemPresentation = (value: "completo" | "fracionado") => {
    itemForm.setValue("apresentacao", value);
    itemForm.setValue("itemId", "");
  };
  const cancelItemSelection = () => {
    setSelectedBase(null);
    setItemSearch("");
    setItemOpen(false);
    itemForm.reset();
  };
  const changeItemSearch = (value: string) => {
    setSelectedBase(null);
    itemForm.reset();
    setItemSearch(value);
  };
  const addToCart = (item: CatalogItem) => {
    const quantity = (cart.find(entry => entry.catalogItem.id === item.id)?.quantidade ?? 0) + 1;
    const quantityError = cartQuantityError(item, quantity);
    if (quantityError) {
      setErrors([quantityError]);
      return;
    }
    setErrors([]);
    setSuccess(false);
    setCart(prev => {
      const existing = prev.find(i => i.catalogItem.id === item.id);
      if (cartQuantityError(item, (existing?.quantidade ?? 0) + 1)) return prev;
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
    setSelectedBase(null);
    itemForm.reset();
  };
  const confirmItemSelection = () => {
    if (!selectedItem || !canAddSelectedItem) return;
    addToCart(selectedItem);
  };
  const updateQty = (id: number, qty: number) => {
    const item = cart.find(entry => entry.catalogItem.id === id);
    if (!item) return;
    const quantityError = cartQuantityError(item.catalogItem, qty);
    if (quantityError) {
      setErrors([quantityError]);
      return;
    }
    setErrors([]);
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
  const handleRegistrar = () => {
    if (submitting.current || loading || loadError) return;
    setSuccess(false);
    const values = form.getValues();
    const errs = validateSale(cart, clienteSelected, values);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    if (!clienteSelected) return;
    setConfirmationError("");
    setSaleReview({
      cart: cart.map(item => ({ ...item, catalogItem: { ...item.catalogItem } })),
      customer: { ...clienteSelected },
      form: { ...values },
    });
  };
  const closeSaleReview = () => {
    if (submitting.current) return;
    setSaleReview(null);
    setConfirmationError("");
  };
  const confirmSale = async () => {
    if (submitting.current || !saleReview) return;
    submitting.current = true;
    setSaving(true);
    setConfirmationError("");
    try {
      await registerSale(saleReview.cart, saleReview.customer, saleReview.form);
      setRegisteredStatus(saleReview.form.isOnline ? "PENDENTE" : "FINALIZADA");
      setSaleReview(null);
      setSuccess(true);
      setCart([]);
      setClienteSelected(null);
      setClienteSearch("");
      setItemSearch("");
      setItemOpen(false);
      setSelectedBase(null);
      itemForm.reset();
      setClienteOpen(false);
      form.reset();
      setReloadKey(previous => previous + 1);
    } catch (error) {
      setConfirmationError(salesErrorMessage(error, "Não foi possível confirmar o registro. Verifique as vendas antes de tentar novamente."));
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
    saleReview,
    reviewTotals: saleReview ? calculateSaleTotals({ cart: saleReview.cart, ...saleReview.form }) : null,
    confirmationError,
    closeSaleReview,
    confirmSale,
    reload: () => setReloadKey(previous => previous + 1),
    clienteSearch,
    setClienteSearch,
    clienteSelected,
    setClienteSelected,
    clienteOpen,
    setClienteOpen,
    itemSearch,
    setItemSearch: changeItemSearch,
    itemGroups,
    selectedGroup,
    selectedItem,
    canAddSelectedItem,
    selectItemGroup,
    itemPresentation,
    setItemPresentation,
    selectedVariantId,
    setSelectedVariantId: (value: string) => itemForm.setValue("itemId", value),
    cancelItemSelection,
    confirmItemSelection,
    itemSearchLoading: itemSearchLoading || (!!itemSearch.trim() && itemSearch.trim() !== debouncedItemSearch),
    itemSearchError,
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
    registeredStatus,
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
