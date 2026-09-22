import { PeractField } from "../../shared/components/peract-field";
import { PeractModal } from "../../shared/components/peract-modal";
import { PeractModalTitle } from "../../shared/components/peract-modal";
import { PeractNativeSelect } from "../../shared/components/peract-select";
import { PeractLabel } from "../../shared/components/peract-label";
import { PeractTag } from "../../shared/components/peract-tag";
import { PeractInputControl } from "../../shared/components/peract-input";
import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { PeractCard } from "../../shared/components/peract-card";
import { useState } from "react";
import { Search, Trash2, ShoppingCart, CheckCircle, X, ChevronDown, Store, Globe, Tag, UserPlus, User, MessageCircle } from "lucide-react";
import { useApp } from "../../app/context/AppContext";
import { triggerBotpressPresencialFlow } from "../../app/services/botpress";
interface CatalogItem {
  id: number;
  nome: string;
  preco: number;
  tipo: "produto" | "decant";
  volume?: string;
  productContextId?: number;
}
const decants: CatalogItem[] = [{
  id: -1,
  nome: "Decant Chanel N°5 2ml",
  preco: 12,
  tipo: "decant",
  volume: "2ml"
}, {
  id: -2,
  nome: "Decant Chanel N°5 5ml",
  preco: 25,
  tipo: "decant",
  volume: "5ml"
}, {
  id: -3,
  nome: "Decant Dior Sauvage 5ml",
  preco: 28,
  tipo: "decant",
  volume: "5ml"
}, {
  id: -4,
  nome: "Decant Dior Sauvage 10ml",
  preco: 50,
  tipo: "decant",
  volume: "10ml"
}, {
  id: -5,
  nome: "Decant Creed Aventus 3ml",
  preco: 28,
  tipo: "decant",
  volume: "3ml"
}, {
  id: -6,
  nome: "Decant YSL Libre 2ml",
  preco: 13,
  tipo: "decant",
  volume: "2ml"
}];
const pagamentos = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Transferência bancária"];
interface CartItem {
  catalogItem: CatalogItem;
  quantidade: number;
}
function SalesPage() {
  const {
    clientes,
    products,
    reduceStock,
    addVenda,
    setClientes
  } = useApp();
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
  const [pagamento, setPagamento] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [canalOnline, setCanalOnline] = useState<"whatsapp" | "site" | null>(null);
  const [frete, setFrete] = useState("");
  // Desconto
  const [tipoDesconto, setTipoDesconto] = useState<"percentual" | "valor">("percentual");
  const [desconto, setDesconto] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showNovoCliente, setShowNovoCliente] = useState(false);

  // Só exibe clientes ATIVOS no PDV
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
  const subtotal = cart.reduce((acc, i) => acc + i.catalogItem.preco * i.quantidade, 0);
  const freteVal = isOnline && frete ? parseFloat(frete) : 0;
  const descontoNum = desconto ? parseFloat(desconto) : 0;
  const descontoValor = tipoDesconto === "percentual" ? subtotal * descontoNum / 100 : descontoNum;
  const descontoAplicado = Math.min(descontoValor, subtotal); // nunca maior que subtotal

  const total = Math.max(0, subtotal - descontoAplicado + freteVal);
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
  return <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <div className="mb-5">
        <h1 className="peract-font-color-default">Registrar Venda</h1>
        <nav className="text-xs peract-font-color-muted mt-0.5">
          Vendas &rsaquo;{" "}
          <span className="text-[#A67449]">Registrar Venda</span>
        </nav>
      </div>

      {success && <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm" role="status">
          <CheckCircle size={18} />
          <div>
            <p className="font-medium">Venda finalizada com sucesso!</p>
            <p className="text-xs text-green-600">
              O estoque foi atualizado automaticamente.
            </p>
          </div>
        </div>}

      {errors.length > 0 && <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm" role="alert">
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>}

      {/* Canal da venda */}
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm p-4 mb-4">
        <p className="peract-font-color-default text-sm mb-3">Canal da venda</p>
        <div className="flex gap-3 mb-3">
          <PeractButtonPrimitive onClick={() => {
          setIsOnline(false);
          setCanalOnline(null);
        }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm transition-all flex-1 justify-center ${!isOnline ? "border-[#A67449] text-[#A67449] bg-amber-50" : "peract-border-color peract-font-color-muted hover:border-gray-300"}`} variant="plain" size="plain">
            <Store size={16} /> Presencial
            {!isOnline && <span className="w-4 h-4 rounded-full border-2 border-[#A67449] flex items-center justify-center ml-1">
                <span className="w-2 h-2 rounded-full bg-[#A67449]" />
              </span>}
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={() => setIsOnline(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm transition-all flex-1 justify-center ${isOnline ? "border-[#A67449] text-[#A67449] bg-amber-50" : "peract-border-color peract-font-color-muted hover:border-gray-300"}`} variant="plain" size="plain">
            <Globe size={16} /> Online
            {isOnline && <span className="w-4 h-4 rounded-full border-2 border-[#A67449] flex items-center justify-center ml-1">
                <span className="w-2 h-2 rounded-full bg-[#A67449]" />
              </span>}
          </PeractButtonPrimitive>
        </div>
        {isOnline && <div>
            <p className="text-xs peract-font-color-muted mb-2">
              Canal online <span className="text-red-400">*</span>
            </p>
            <div className="flex gap-2">
              <PeractButtonPrimitive onClick={() => setCanalOnline("whatsapp")} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all flex-1 justify-center ${canalOnline === "whatsapp" ? "border-green-500 text-green-600 bg-green-50" : "peract-border-color peract-font-color-muted hover:border-gray-300"}`} variant="plain" size="plain">
                <MessageCircle size={15} /> WhatsApp
                {canalOnline === "whatsapp" && <span className="w-3.5 h-3.5 rounded-full border-2 border-green-500 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </span>}
              </PeractButtonPrimitive>
              <PeractButtonPrimitive onClick={() => setCanalOnline("site")} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all flex-1 justify-center ${canalOnline === "site" ? "border-blue-500 text-blue-600 bg-blue-50" : "peract-border-color peract-font-color-muted hover:border-gray-300"}`} variant="plain" size="plain">
                <Globe size={15} /> Site
                {canalOnline === "site" && <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </span>}
              </PeractButtonPrimitive>
            </div>
          </div>}
      </PeractCard>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left col */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Cliente */}
          <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="peract-font-color-default text-sm">
                Cliente <span className="text-red-500">*</span>
              </h2>
              <PeractButtonPrimitive onClick={() => setShowNovoCliente(true)} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border peract-border-color text-gray-600 hover:bg-gray-50 transition-colors" title="Cadastrar novo cliente" variant="plain" size="plain" aria-label="Cadastrar novo cliente">
                <UserPlus size={13} /> Novo cliente
              </PeractButtonPrimitive>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 border peract-border-color rounded-lg px-3 py-2 cursor-pointer" onClick={() => setClienteOpen(true)}>
                {clienteSelected ? <User size={15} className="peract-font-color-muted shrink-0" /> : <Search size={15} className="peract-font-color-muted shrink-0" />}
                <PeractInputControl type="text" placeholder="Buscar por nome ou telefone..." value={clienteSelected ? displayLabel(clienteSelected) : clienteSearch} onChange={e => {
                setClienteSearch(e.target.value);
                setClienteSelected(null);
                setClienteOpen(true);
              }} onFocus={() => setClienteOpen(true)} className="flex-1 text-sm outline-none peract-font-color-default placeholder:text-gray-400 bg-transparent" />
                {clienteSelected && <PeractButtonPrimitive onClick={e => {
                e.stopPropagation();
                setClienteSelected(null);
                setClienteSearch("");
              }} className="peract-font-color-muted hover:text-gray-600" variant="plain" size="plain" aria-label="Fechar">
                    <X size={14} />
                  </PeractButtonPrimitive>}
              </div>
              {clienteOpen && !clienteSelected && <PeractCard className="absolute top-full left-0 right-0 mt-1 peract-bg-card border peract-border-color rounded-xl shadow-lg z-20 overflow-hidden max-h-56 overflow-y-auto">
                  {clientesFiltrados.length === 0 ? <div className="px-4 py-3 text-center">
                      <p className="text-sm peract-font-color-muted mb-2">
                        Nenhum cliente encontrado
                      </p>
                      <PeractButtonPrimitive onClick={e => {
                  e.stopPropagation();
                  setClienteOpen(false);
                  setShowNovoCliente(true);
                }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg mx-auto text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
                        <UserPlus size={12} /> Cadastrar novo cliente
                      </PeractButtonPrimitive>
                    </div> : clientesFiltrados.map(c => <PeractButtonPrimitive key={c.id} className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between gap-3" onClick={() => {
                setClienteSelected({
                  id: c.id,
                  nome: c.nome,
                  telefone: c.telefone,
                  email: c.email
                });
                setClienteSearch("");
                setClienteOpen(false);
              }} variant="plain" size="plain">
                        <span className="text-sm peract-font-color-default truncate">
                          {c.nome}
                        </span>
                        <span className="text-xs peract-font-color-muted shrink-0 font-mono">
                          {c.telefone}
                        </span>
                      </PeractButtonPrimitive>)}
                </PeractCard>}
            </div>
            {clienteOpen && <div className="fixed inset-0 z-10" onClick={() => setClienteOpen(false)} />}
          </PeractCard>

          {/* Adicionar item */}
          <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm p-4">
            <h2 className="peract-font-color-default text-sm mb-3">
              Adicionar item ao carrinho
            </h2>
            <div className="relative">
              <div className="flex items-center gap-2 border peract-border-color rounded-lg px-3 py-2">
                <Search size={15} className="peract-font-color-muted shrink-0" />
                <PeractInputControl type="text" placeholder="Buscar produto ou decant..." value={itemSearch} onChange={e => {
                setItemSearch(e.target.value);
                setItemOpen(true);
              }} onFocus={() => setItemOpen(true)} className="flex-1 text-sm outline-none peract-font-color-default placeholder:text-gray-400" />
              </div>
              {itemOpen && itemSearch && catalogoFiltrado.length > 0 && <PeractCard className="absolute top-full left-0 right-0 mt-1 peract-bg-card border peract-border-color rounded-xl shadow-lg z-20 overflow-hidden max-h-52 overflow-y-auto">
                  {catalogoFiltrado.map(p => {
                const product = products.find(x => x.id === p.productContextId);
                const estoqueAtual = product?.currentStock;
                return <PeractButtonPrimitive key={p.id} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between gap-3" onClick={() => addToCart(p)} variant="plain" size="plain">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{p.nome}</span>
                          {p.volume && <span className="text-xs peract-font-color-muted bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                              {p.volume}
                            </span>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {estoqueAtual !== undefined && <span className={`text-xs ${estoqueAtual === 0 ? "text-red-500" : "peract-font-color-muted"}`}>
                              {estoqueAtual === 0 ? "Esgotado" : `${estoqueAtual} em est.`}
                            </span>}
                          <span className="text-xs font-medium" style={{
                      color: "#A67449"
                    }}>
                            R$ {p.preco.toFixed(2)}
                          </span>
                        </div>
                      </PeractButtonPrimitive>;
              })}
                </PeractCard>}
              {itemOpen && <div className="fixed inset-0 z-10" onClick={() => setItemOpen(false)} />}
            </div>
          </PeractCard>

          {/* Cart */}
          <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <ShoppingCart size={16} style={{
              color: "#A67449"
            }} />
              <h2 className="peract-font-color-default text-sm">Carrinho</h2>
              {cart.length > 0 && <PeractTag className="ml-auto text-xs px-2 py-0.5 rounded-full text-white" style={{
              background: "#A67449"
            }}>
                  {cart.length} item(s)
                </PeractTag>}
            </div>
            {cart.length === 0 ? <div className="py-12 text-center peract-font-color-muted text-sm">
                <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                Nenhum item adicionado ainda.
              </div> : <>
                <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-50" style={{
              background: "#F9F9F9"
            }}>
                  <div className="col-span-5 text-xs peract-font-color-muted">Item</div>
                  <div className="col-span-2 text-xs peract-font-color-muted text-center">
                    Qtd.
                  </div>
                  <div className="col-span-2 text-xs peract-font-color-muted text-right">
                    Unitário
                  </div>
                  <div className="col-span-2 text-xs peract-font-color-muted text-right">
                    Total
                  </div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-gray-50">
                  {cart.map(item => <div key={item.catalogItem.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                      <div className="col-span-12 sm:col-span-5">
                        <p className="text-sm font-medium peract-font-color-default truncate">
                          {item.catalogItem.nome}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {item.catalogItem.volume && <span className="text-xs peract-font-color-muted bg-gray-100 px-1.5 py-0.5 rounded">
                              {item.catalogItem.volume}
                            </span>}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${item.catalogItem.tipo === "decant" ? "bg-blue-100 text-blue-600" : "bg-stone-100 text-stone-600"}`}>
                            {item.catalogItem.tipo === "decant" ? "Decant" : "Produto"}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-2 flex items-center justify-center">
                        <PeractInputControl type="number" min={1} value={item.quantidade} onChange={e => updateQty(item.catalogItem.id, parseInt(e.target.value) || 0)} className="w-16 border peract-border-color rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-[#A67449]" />
                      </div>
                      <div className="col-span-3 sm:col-span-2 text-sm text-gray-600 text-right">
                        R$ {item.catalogItem.preco.toFixed(2)}
                      </div>
                      <div className="col-span-4 sm:col-span-2 text-sm font-medium text-right peract-font-color-default">
                        R${" "}
                        {(item.catalogItem.preco * item.quantidade).toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <PeractButtonPrimitive onClick={() => removeItem(item.catalogItem.id)} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors" variant="plain" size="plain" aria-label="Excluir">
                          <Trash2 size={14} />
                        </PeractButtonPrimitive>
                      </div>
                    </div>)}
                </div>
              </>}
          </PeractCard>
        </div>

        {/* Right col */}
        <div className="lg:col-span-2">
          <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm p-4 sticky top-4">
            <h2 className="peract-font-color-default text-sm mb-4">Resumo da venda</h2>

            {/* Canal */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-sm" style={{
            background: isOnline ? "#EFF6FF" : "#F9F5F1"
          }}>
              {isOnline ? <Globe size={14} className="text-blue-600" /> : <Store size={14} style={{
              color: "#A67449"
            }} />}
              <span className={`text-xs font-medium ${isOnline ? "text-blue-600" : "text-[#A67449]"}`}>
                {isOnline ? "Venda Online" : "Venda Presencial"}
              </span>
            </div>

            {/* Cliente */}
            <div className="p-3 rounded-lg mb-3 text-sm" style={{
            background: clienteSelected ? "#F9F5F1" : "#F9F9F9"
          }}>
              <p className="text-xs peract-font-color-muted mb-0.5">Cliente</p>
              {clienteSelected ? <>
                  <p className="font-medium peract-font-color-default">
                    {clienteSelected.nome}
                  </p>
                  <p className="text-xs peract-font-color-muted font-mono">
                    {clienteSelected.telefone}
                  </p>
                </> : <p className="peract-font-color-muted italic">Não vinculado</p>}
            </div>

            {/* Totais */}
            <div className="flex flex-col gap-2 mb-4 py-3 border-y peract-border-color">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Subtotal ({cart.reduce((a, i) => a + i.quantidade, 0)} itens)
                </span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {descontoAplicado > 0 && <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Desconto
                  </span>
                  <span>- R$ {descontoAplicado.toFixed(2)}</span>
                </div>}
              {isOnline && freteVal > 0 && <div className="flex justify-between text-sm peract-font-color-muted">
                  <span>Frete</span>
                  <span>R$ {freteVal.toFixed(2)}</span>
                </div>}
              <div className="flex justify-between font-medium pt-1 border-t peract-border-color peract-font-color-default">
                <span className="text-sm">Total</span>
                <span className="text-base">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Frete (online only) */}
            {isOnline && <PeractField className="mb-4">
                <PeractLabel className="text-xs peract-font-color-muted block mb-1.5">
                  Valor do frete (R$) *
                </PeractLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 peract-font-color-muted text-sm">
                    R$
                  </span>
                  <PeractInputControl type="number" min={0} step={0.01} value={frete} onChange={e => setFrete(e.target.value)} placeholder="0,00" className="w-full border peract-border-color rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#A67449]" />
                </div>
              </PeractField>}

            {/* Desconto */}
            <PeractField className="mb-4">
              <PeractLabel className="text-xs peract-font-color-muted block mb-1.5 flex items-center gap-1">
                <Tag size={11} /> Desconto (opcional)
              </PeractLabel>
              <div className="flex gap-2 mb-2">
                <PeractButtonPrimitive onClick={() => setTipoDesconto("percentual")} className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${tipoDesconto === "percentual" ? "text-white border-[#A67449]" : "peract-border-color peract-font-color-muted hover:border-gray-300 peract-bg-card"}`} style={tipoDesconto === "percentual" ? {
                background: "#A67449"
              } : {}} variant="plain" size="plain">
                  % Percentual
                </PeractButtonPrimitive>
                <PeractButtonPrimitive onClick={() => setTipoDesconto("valor")} className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${tipoDesconto === "valor" ? "text-white border-[#A67449]" : "peract-border-color peract-font-color-muted hover:border-gray-300 peract-bg-card"}`} style={tipoDesconto === "valor" ? {
                background: "#A67449"
              } : {}} variant="plain" size="plain">
                  R$ Valor fixo
                </PeractButtonPrimitive>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 peract-font-color-muted text-sm">
                  {tipoDesconto === "percentual" ? "%" : "R$"}
                </span>
                <PeractInputControl type="number" min={0} max={tipoDesconto === "percentual" ? 100 : undefined} step={0.01} value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0" className="w-full border peract-border-color rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#A67449]" />
              </div>
              {descontoAplicado > 0 && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Tag size={10} /> Desconto de R$ {descontoAplicado.toFixed(2)}{" "}
                  aplicado
                </p>}
            </PeractField>

            {/* Pagamento */}
            <PeractField className="mb-4">
              <PeractLabel className="text-xs peract-font-color-muted block mb-1.5">
                Tipo de pagamento *
              </PeractLabel>
              <div className="relative">
                <PeractNativeSelect value={pagamento} onChange={e => setPagamento(e.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#A67449] appearance-none pr-8">
                  <option value="">Selecionar...</option>
                  {pagamentos.map(p => <option key={p} value={p}>
                      {p}
                    </option>)}
                </PeractNativeSelect>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 peract-font-color-muted pointer-events-none" />
              </div>
            </PeractField>

            <PeractButtonPrimitive onClick={handleFinalizar} className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{
            background: "#A67449"
          }} variant="plain" size="plain">
              <CheckCircle size={16} /> Finalizar Venda
            </PeractButtonPrimitive>
            <p className="text-xs peract-font-color-muted text-center mt-2">
              O estoque será atualizado automaticamente.
            </p>
          </PeractCard>
        </div>
      </div>

      {/* ─── Quick New Client Modal ─── */}
      {showNovoCliente && <NovoClienteModal onClose={() => setShowNovoCliente(false)} onSave={(nome, telefone) => {
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
    }} />}
    </div>;
}

/* ─── Quick New Client Modal ─── */
export { SalesPage };
function NovoClienteModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (nome: string, telefone: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const ACC = "#c29958";
  const DARK = "#050300";
  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Obrigatório.";
    if (!telefone.trim()) e.telefone = "Obrigatório.";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      onSave(nome.trim(), telefone.trim());
      onClose();
    }, 900);
  };
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 peract-bg-accent">
              <UserPlus size={15} />
            </div>
            <PeractModalTitle className="text-sm font-medium peract-font-color-default">
              Cadastrar novo cliente
            </PeractModalTitle>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar">
            <X size={18} />
          </PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle size={16} /> Cliente cadastrado!
            </div>}
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">
              Nome completo <span className="text-red-500">*</span>
            </PeractLabel>
            <PeractInputControl type="text" value={nome} onChange={e => {
          setNome(e.target.value);
          setErrors(p => ({
            ...p,
            nome: ""
          }));
        }} placeholder="Ex: Ana Lima" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.nome ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.nome ? "#f87171" : ""} />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </PeractField>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">
              Telefone <span className="text-red-500">*</span>
            </PeractLabel>
            <PeractInputControl type="text" value={telefone} onChange={e => {
          setTelefone(e.target.value);
          setErrors(p => ({
            ...p,
            telefone: ""
          }));
        }} placeholder="(11) 99999-9999" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.telefone ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.telefone ? "#f87171" : ""} />
            {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
          </PeractField>
          <p className="text-xs peract-font-color-muted">
            Endereço e demais dados podem ser preenchidos depois em{" "}
            <strong>Gestão de Pessoas</strong>.
          </p>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">
            Cancelar
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            Cadastrar
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
