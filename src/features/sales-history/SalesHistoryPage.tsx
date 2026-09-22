import { PeractField } from "../../shared/components/peract-field";
import { PeractTableCell } from "../../shared/components/peract-table";
import { PeractTableBody } from "../../shared/components/peract-table";
import { PeractTableHead } from "../../shared/components/peract-table";
import { PeractTableRow } from "../../shared/components/peract-table";
import { PeractTableHeader } from "../../shared/components/peract-table";
import { PeractTableRoot } from "../../shared/components/peract-table";
import { PeractInputControl } from "../../shared/components/peract-input";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractNativeSelect } from "../../shared/components/peract-select";
import { PeractLabel } from "../../shared/components/peract-label";
import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { PeractModal } from "../../shared/components/peract-modal";
import { PeractModalTitle } from "../../shared/components/peract-modal";
import { PeractTag } from "../../shared/components/peract-tag";
import { useState } from "react";
import { Search, Eye, X, Pencil, Globe, Store, Truck, CheckCircle, ChevronDown, Clock, XCircle, Tag, MessageCircle } from "lucide-react";
import { useApp } from "../../app/context/AppContext";
import type { Venda } from "../../app/context/AppContext";
function CanalBadge({
  venda
}: {
  venda: Venda;
}) {
  if (venda.tipoVenda === "presencial") {
    return <PeractTag className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full peract-font-color-accent" style={{
      background: `${ACC}18`
    }}>
        <Store size={10} /> Presencial
      </PeractTag>;
  }
  if (venda.canalOnline === "whatsapp") {
    return <PeractTag className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <MessageCircle size={10} /> WhatsApp
      </PeractTag>;
  }
  return <PeractTag className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
      <Globe size={10} /> Site
    </PeractTag>;
}
const ACC = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";
const pagamentosOpcoes = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Transferência bancária"];
function getVendaStatus(v: Venda): "Pendente" | "Finalizado" | "Cancelado" {
  if (v.cancelada) return "Cancelado";
  if (v.tipoVenda === "presencial" || v.enviado) return "Finalizado";
  return "Pendente";
}
function StatusBadge({
  status
}: {
  status: "Pendente" | "Finalizado" | "Cancelado";
}) {
  const cfg = {
    Pendente: {
      cls: "bg-amber-100 text-amber-700",
      icon: <Clock size={10} />
    },
    Finalizado: {
      cls: "bg-green-100 text-green-700",
      icon: <CheckCircle size={10} />
    },
    Cancelado: {
      cls: "bg-red-100 text-red-600",
      icon: <XCircle size={10} />
    }
  };
  const {
    cls,
    icon
  } = cfg[status];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {icon} {status}
    </span>;
}

/* ─── Recibo Modal ─── */
function ReciboModal({
  venda,
  onClose
}: {
  venda: Venda;
  onClose: () => void;
}) {
  const status = getVendaStatus(venda);
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-md max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <div>
            <div className="flex items-center gap-2">
              <PeractModalTitle className="peract-font-color-default">Recibo da Venda</PeractModalTitle>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs peract-font-color-muted mt-0.5">{venda.id} · {venda.data}</p>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm" style={{
        background: venda.tipoVenda === "presencial" ? WARM : venda.canalOnline === "whatsapp" ? "#f0fdf4" : "#EFF6FF"
      }}>
            {venda.tipoVenda === "presencial" ? <Store size={14} className="peract-font-color-accent" /> : venda.canalOnline === "whatsapp" ? <MessageCircle size={14} className="text-green-600" /> : <Globe size={14} className="text-blue-600" />}
            <span className="text-xs font-medium" style={{
          color: venda.tipoVenda === "presencial" ? ACC : venda.canalOnline === "whatsapp" ? "#16a34a" : "#2563eb"
        }}>
              {venda.tipoVenda === "presencial" ? "Venda Presencial" : venda.canalOnline === "whatsapp" ? "Venda WhatsApp" : "Venda pelo Site"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg peract-bg-accent-soft">
              <p className="text-xs peract-font-color-muted mb-0.5">Cliente</p>
              <p className="text-sm font-medium peract-font-color-default">{venda.cliente || "Não vinculado"}</p>
            </div>
            <div className="p-3 rounded-lg peract-bg-accent-soft">
              <p className="text-xs peract-font-color-muted mb-0.5">Pagamento</p>
              <p className="text-sm font-medium peract-font-color-default">{venda.pagamento}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs peract-font-color-muted font-medium mb-2 uppercase tracking-wide">Itens comprados</p>
            <div className="border peract-border-color rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs peract-font-color-muted border-b border-gray-50" style={{
            background: "#F9F9F9"
          }}>
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qtd.</div>
                <div className="col-span-2 text-right">Unit.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {venda.itens.filter(i => i.quantidade > 0).map((item, idx) => <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="col-span-6">
                    <p className="text-xs font-medium peract-font-color-default leading-tight">{item.nome}</p>
                    {item.volume && <span className="text-xs peract-font-color-muted">{item.volume}</span>}
                  </div>
                  <div className="col-span-2 text-xs text-gray-600 text-center">{item.quantidade}</div>
                  <div className="col-span-2 text-xs text-gray-600 text-right">R${item.valorUnitario.toFixed(2)}</div>
                  <div className="col-span-2 text-xs font-medium text-right peract-font-color-default">
                    R${(item.valorUnitario * item.quantidade).toFixed(2)}
                  </div>
                </div>)}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 py-3 border-t peract-border-color">
            {venda.desconto !== undefined && venda.desconto > 0 && <div className="flex items-center justify-between text-sm text-green-600">
                <span className="flex items-center gap-1"><Tag size={12} /> Desconto</span>
                <span>- R$ {venda.desconto.toFixed(2).replace(".", ",")}</span>
              </div>}
            {venda.tipoVenda === "online" && venda.frete !== undefined && venda.frete > 0 && <>
                <div className="flex items-center justify-between text-sm peract-font-color-muted">
                  <span>Subtotal</span>
                  <span>R$ {(venda.total - venda.frete + (venda.desconto ?? 0)).toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex items-center justify-between text-sm peract-font-color-muted">
                  <span className="flex items-center gap-1.5"><Truck size={13} className="text-blue-400" /> Frete</span>
                  <span>R$ {venda.frete.toFixed(2).replace(".", ",")}</span>
                </div>
              </>}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total da venda</span>
              <span className="text-lg font-semibold peract-font-color-accent">
                R$ {venda.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="w-full px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            Fechar
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}

/* ─── Edit Modal — apenas Status e Pagamento são editáveis ─── */
function EditModal({
  venda,
  onClose,
  onSave
}: {
  venda: Venda;
  onClose: () => void;
  onSave: (v: Venda) => void;
}) {
  const [pagamento, setPagamento] = useState(venda.pagamento);
  const initialStatus: "Pendente" | "Finalizado" | "Cancelado" = venda.cancelada ? "Cancelado" : venda.tipoVenda === "presencial" || venda.enviado ? "Finalizado" : "Pendente";
  const [novoStatus, setNovoStatus] = useState<"Pendente" | "Finalizado" | "Cancelado">(initialStatus);

  // Presencial só pode ser Finalizado ou Cancelado
  const statusOpcoes: Array<"Pendente" | "Finalizado" | "Cancelado"> = venda.tipoVenda === "online" ? ["Pendente", "Finalizado", "Cancelado"] : ["Finalizado", "Cancelado"];
  const statusCfg: Record<"Pendente" | "Finalizado" | "Cancelado", {
    active: string;
    base: string;
    icon: React.ReactNode;
  }> = {
    Pendente: {
      active: "border-amber-400 text-amber-700 bg-amber-50",
      base: "border-gray-200 text-gray-500 hover:border-gray-300",
      icon: <Clock size={13} />
    },
    Finalizado: {
      active: "border-green-500 text-green-700 bg-green-50",
      base: "border-gray-200 text-gray-500 hover:border-gray-300",
      icon: <CheckCircle size={13} />
    },
    Cancelado: {
      active: "border-red-400 text-red-600 bg-red-50",
      base: "border-gray-200 text-gray-500 hover:border-gray-300",
      icon: <XCircle size={13} />
    }
  };
  const handleSave = () => {
    const cancelada = novoStatus === "Cancelado";
    const enviado = venda.tipoVenda === "online" ? novoStatus === "Finalizado" : false;
    onSave({
      ...venda,
      pagamento,
      cancelada,
      enviado
    });
  };
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-md max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <div>
            <PeractModalTitle className="peract-font-color-default">Editar Venda</PeractModalTitle>
            <p className="text-xs peract-font-color-muted mt-0.5">{venda.id} · {venda.data}</p>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>

        <div className="p-4 flex flex-col gap-5">
          {/* ── Dados exibidos (read-only) ── */}
          <div className="rounded-xl border peract-border-color overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-50" style={{
          background: "#fafaf9"
        }}>
              <p className="text-xs font-medium peract-font-color-muted uppercase tracking-wide">Dados da venda</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              {/* Canal — fixo, não editável */}
              <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                <p className="text-xs peract-font-color-muted mb-1">Canal</p>
                <div className="flex items-center gap-1.5">
                  <CanalBadge venda={venda} />
                </div>
              </div>
              {/* Cliente */}
              <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                <p className="text-xs peract-font-color-muted mb-1">Cliente</p>
                <p className="text-sm font-medium peract-font-color-default truncate">{venda.cliente || "—"}</p>
              </div>
              {/* Total */}
              <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                <p className="text-xs peract-font-color-muted mb-1">Valor total</p>
                <p className="text-sm font-medium peract-font-color-default">R$ {venda.total.toFixed(2).replace(".", ",")}</p>
              </div>
              {/* Frete */}
              {venda.tipoVenda === "online" && <div className="p-2.5 rounded-lg peract-bg-accent-soft">
                  <p className="text-xs peract-font-color-muted mb-1">Frete</p>
                  <p className="text-sm text-gray-700">
                    {venda.frete ? `R$ ${venda.frete.toFixed(2).replace(".", ",")}` : "—"}
                  </p>
                </div>}
              {/* Desconto */}
              {venda.desconto && venda.desconto > 0 && <div className="p-2.5 rounded-lg bg-green-50">
                  <p className="text-xs peract-font-color-muted mb-1">Desconto aplicado</p>
                  <p className="text-sm font-medium text-green-700">- R$ {venda.desconto.toFixed(2).replace(".", ",")}</p>
                </div>}
            </div>

            {/* Itens (read-only) */}
            <div className="border-t border-gray-50">
              <div className="px-3 py-2 border-b border-gray-50" style={{
            background: "#fafaf9"
          }}>
                <p className="text-xs peract-font-color-muted">Itens da venda</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-36 overflow-y-auto">
                {venda.itens.filter(i => i.quantidade > 0).map((item, idx) => <div key={idx} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-xs text-gray-700">{item.nome} {item.volume && <span className="peract-font-color-muted">({item.volume})</span>}</p>
                      <p className="text-xs peract-font-color-muted">×{item.quantidade}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-600">R$ {(item.valorUnitario * item.quantidade).toFixed(2)}</span>
                  </div>)}
              </div>
            </div>
          </div>

          {/* ── Campos editáveis ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-gray-100" />
              <p className="text-xs peract-font-color-muted uppercase tracking-wide">Campos editáveis</p>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Status */}
            <div>
              <PeractLabel className="text-xs peract-font-color-muted block mb-2">Status da venda *</PeractLabel>
              <div className="flex gap-2">
                {statusOpcoes.map(s => <PeractButtonPrimitive key={s} onClick={() => setNovoStatus(s)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all flex-1 justify-center ${novoStatus === s ? statusCfg[s].active : statusCfg[s].base}`} variant="plain" size="plain">
                    {statusCfg[s].icon} {s}
                  </PeractButtonPrimitive>)}
              </div>
              {novoStatus === "Pendente" && <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <Clock size={11} /> Este pedido voltará para Pedidos Online como pendente.
                </p>}
              {novoStatus === "Cancelado" && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <XCircle size={11} /> A venda será marcada como cancelada.
                </p>}
            </div>

            {/* Pagamento */}
            <PeractField>
              <PeractLabel className="text-xs peract-font-color-muted block mb-1.5">Tipo de pagamento *</PeractLabel>
              <div className="relative">
                <PeractNativeSelect value={pagamento} onChange={e => setPagamento(e.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none appearance-none pr-8" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
                  <option value="">Selecionar...</option>
                  {pagamentosOpcoes.map(p => <option key={p} value={p}>{p}</option>)}
                </PeractNativeSelect>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 peract-font-color-muted pointer-events-none" />
              </div>
            </PeractField>
          </div>
        </div>

        <div className="p-4 border-t peract-border-color flex gap-2">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm border peract-border-color text-gray-600 hover:bg-gray-50 transition-colors" variant="plain" size="plain">Fechar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 flex items-center justify-center gap-2 peract-bg-accent" variant="plain" size="plain">
            <CheckCircle size={15} /> Salvar alterações
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
type StatusFilter = "todos" | "finalizado" | "cancelado";
function SalesHistoryPage() {
  const {
    vendas,
    updateVenda,
    currentUser
  } = useApp();
  const isAdmin = currentUser?.cargo === "Administrador";
  const [search, setSearch] = useState("");
  const [pagamentoFilter, setPagamentoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState<"todos" | "online" | "presencial">("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const [editVenda, setEditVenda] = useState<Venda | null>(null);
  const vendasExibidas = vendas.filter(v => getVendaStatus(v) !== "Pendente");
  const finalizadas = vendasExibidas.filter(v => getVendaStatus(v) === "Finalizado");
  const canceladas = vendasExibidas.filter(v => getVendaStatus(v) === "Cancelado");
  const totalFaturamento = finalizadas.reduce((acc, v) => acc + v.total, 0);
  const filtered = vendasExibidas.filter(v => {
    const st = getVendaStatus(v);
    if (statusFilter === "finalizado" && st !== "Finalizado") return false;
    if (statusFilter === "cancelado" && st !== "Cancelado") return false;
    const matchSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
    const matchPag = pagamentoFilter === "todos" || v.pagamento === pagamentoFilter;
    const matchTipo = tipoFilter === "todos" || v.tipoVenda === tipoFilter;
    return matchSearch && matchPag && matchTipo;
  });
  const handleSaveEdit = (updated: Venda) => {
    updateVenda(updated);
    setEditVenda(null);
  };
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {viewVenda && <ReciboModal venda={viewVenda} onClose={() => setViewVenda(null)} />}
      {editVenda && <EditModal venda={editVenda} onClose={() => setEditVenda(null)} onSave={handleSaveEdit} />}

      <div className="mb-5">
        <h1 className="peract-font-color-default">Histórico de Vendas</h1>
        <nav className="text-xs peract-font-color-muted mt-0.5">Vendas &rsaquo; <span className="peract-font-color-accent">Histórico</span></nav>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 shadow-sm">
          <p className="text-xs peract-font-color-muted">Total de vendas</p>
          <p className="text-2xl font-semibold mt-1 peract-font-color-default">{vendasExibidas.length}</p>
        </PeractCard>
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 shadow-sm">
          <p className="text-xs peract-font-color-muted">Finalizadas</p>
          <p className="text-2xl font-semibold mt-1 text-green-600">{finalizadas.length}</p>
        </PeractCard>
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 shadow-sm">
          <p className="text-xs peract-font-color-muted">Canceladas</p>
          <p className="text-2xl font-semibold mt-1 text-red-500">{canceladas.length}</p>
        </PeractCard>
        {isAdmin && <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 shadow-sm">
            <p className="text-xs peract-font-color-muted">Faturamento</p>
            <p className="text-xl font-semibold mt-1 peract-font-color-accent">
              R$ {totalFaturamento.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </p>
          </PeractCard>}
      </div>

      {/* Filters */}
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] border peract-border-color rounded-lg px-3 py-2">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="text" placeholder="Buscar venda ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
        </div>
        <PeractNativeSelect value={pagamentoFilter} onChange={e => setPagamentoFilter(e.target.value)} className="border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none sm:w-44" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
          <option value="todos">Todos os pagamentos</option>
          {pagamentosOpcoes.map(p => <option key={p} value={p}>{p}</option>)}
        </PeractNativeSelect>
        <div className="flex rounded-lg overflow-hidden border peract-border-color self-start">
          {(["todos", "presencial", "online"] as const).map(key => <PeractButtonPrimitive key={key} onClick={() => setTipoFilter(key)} className="px-3 py-2 text-xs transition-all" style={tipoFilter === key ? {
          background: ACC,
          color: "white"
        } : {
          background: "white",
          color: "#4b5563"
        }} variant="plain" size="plain">
              {key === "todos" ? "Todos" : key === "presencial" ? "Presencial" : "Online (WA/Site)"}
            </PeractButtonPrimitive>)}
        </div>
        <div className="flex rounded-lg overflow-hidden border peract-border-color self-start">
          {[{
          key: "todos" as StatusFilter,
          label: "Todos"
        }, {
          key: "finalizado" as StatusFilter,
          label: "Finalizado"
        }, {
          key: "cancelado" as StatusFilter,
          label: "Cancelado"
        }].map(({
          key,
          label
        }) => <PeractButtonPrimitive key={key} onClick={() => setStatusFilter(key)} className="px-3 py-2 text-xs transition-all" style={statusFilter === key ? {
          background: ACC,
          color: "white"
        } : {
          background: "white",
          color: "#4b5563"
        }} variant="plain" size="plain">
              {label}
            </PeractButtonPrimitive>)}
        </div>
      </PeractCard>

      {/* Table desktop */}
      <PeractCard className="hidden md:block peract-bg-card rounded-xl border peract-border-color shadow-sm">
        <div className="overflow-auto max-h-[520px]">
          <PeractTableRoot className="w-full">
            <PeractTableHeader className="sticky top-0 z-10">
              <PeractTableRow style={{
              background: "#fafaf9"
            }}>
                {["Venda", "Data", "Cliente", "Canal", "Pagamento", "Status", "Valor Total", ...(isAdmin ? ["Ações"] : [])].map(h => <PeractTableHead key={h} className="text-left px-4 py-3 text-xs font-medium peract-font-color-muted">{h}</PeractTableHead>)}
              </PeractTableRow>
            </PeractTableHeader>
            <PeractTableBody className="divide-y divide-gray-50">
              {filtered.length === 0 ? <PeractTableRow><PeractTableCell colSpan={8} className="text-center py-12 peract-font-color-muted text-sm">Nenhuma venda encontrada.</PeractTableCell></PeractTableRow> : filtered.map(venda => {
              const status = getVendaStatus(venda);
              return <PeractTableRow key={venda.id} className={`hover:bg-gray-50/50 transition-colors ${status === "Cancelado" ? "opacity-60" : ""}`}>
                    <PeractTableCell className="px-4 py-3"><span className="text-sm font-mono font-medium text-gray-700">{venda.id}</span></PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm text-gray-600">{venda.data}</PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm font-medium peract-font-color-default">{venda.cliente || <span className="peract-font-color-muted italic">—</span>}</PeractTableCell>
                    <PeractTableCell className="px-4 py-3"><CanalBadge venda={venda} /></PeractTableCell>
                    <PeractTableCell className="px-4 py-3"><PeractTag className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">{venda.pagamento}</PeractTag></PeractTableCell>
                    <PeractTableCell className="px-4 py-3"><StatusBadge status={status} /></PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm font-medium peract-font-color-default">R$ {venda.total.toFixed(2).replace(".", ",")}</PeractTableCell>
                    {isAdmin && <PeractTableCell className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <PeractButtonPrimitive onClick={() => setViewVenda(venda)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-gray-100" title="Ver recibo" variant="plain" size="plain" aria-label="Ver recibo"><Eye size={15} /></PeractButtonPrimitive>
                          <PeractButtonPrimitive onClick={() => setEditVenda(venda)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-gray-100" title="Editar" variant="plain" size="plain" aria-label="Editar"><Pencil size={15} /></PeractButtonPrimitive>
                        </div>
                      </PeractTableCell>}
                  </PeractTableRow>;
            })}
            </PeractTableBody>
          </PeractTableRoot>
        </div>
        <div className="px-4 py-3 border-t border-gray-50"><p className="text-xs peract-font-color-muted">{filtered.length} venda(s)</p></div>
      </PeractCard>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map(venda => {
        const status = getVendaStatus(venda);
        return <div key={venda.id} className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${status === "Cancelado" ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono peract-font-color-muted">{venda.id}</span>
                  <StatusBadge status={status} />
                </div>
                <div className="flex items-center gap-1">
                  <PeractButtonPrimitive onClick={() => setViewVenda(venda)} className="p-1 rounded-lg peract-font-color-muted hover:bg-gray-100" variant="plain" size="plain" aria-label="Ver detalhes"><Eye size={15} /></PeractButtonPrimitive>
                  {isAdmin && <PeractButtonPrimitive onClick={() => setEditVenda(venda)} className="p-1 rounded-lg peract-font-color-muted hover:bg-gray-100" variant="plain" size="plain" aria-label="Editar"><Pencil size={15} /></PeractButtonPrimitive>}
                </div>
              </div>
              <p className="text-sm font-medium peract-font-color-default">{venda.cliente || <span className="peract-font-color-muted italic">Sem cliente</span>}</p>
              <div className="flex items-center gap-2 mt-1 mb-2 flex-wrap">
                <CanalBadge venda={venda} />
                <PeractTag className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{venda.pagamento}</PeractTag>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-xs peract-font-color-muted">{venda.data}</p>
                  {venda.tipoVenda === "online" && venda.frete !== undefined && venda.frete > 0 && <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5"><Truck size={11} /> Frete: R$ {venda.frete.toFixed(2)}</p>}
                </div>
                <p className="text-sm font-semibold peract-font-color-accent">R$ {venda.total.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>;
      })}
        {filtered.length === 0 && <PeractCard className="text-center py-12 peract-font-color-muted text-sm peract-bg-card rounded-xl border peract-border-color">Nenhuma venda encontrada.</PeractCard>}
      </div>
    </div>;
}
export { SalesHistoryPage };
