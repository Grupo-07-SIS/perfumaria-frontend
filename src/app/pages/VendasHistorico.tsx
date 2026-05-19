import { useState } from "react";
import {
  Search, Eye, X, Pencil,
  Globe, Store, Truck, CheckCircle, ChevronDown,
  Clock, XCircle, Tag, MessageCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Venda } from "../context/AppContext";

function CanalBadge({ venda }: { venda: Venda }) {
  if (venda.tipoVenda === "presencial") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: `${ACC}18`, color: ACC }}>
        <Store size={10} /> Presencial
      </span>
    );
  }
  if (venda.canalOnline === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <MessageCircle size={10} /> WhatsApp
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
      <Globe size={10} /> Site
    </span>
  );
}

const ACC = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";

const pagamentosOpcoes = [
  "Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Transferência bancária",
];

function getVendaStatus(v: Venda): "Pendente" | "Finalizado" | "Cancelado" {
  if (v.cancelada) return "Cancelado";
  if (v.tipoVenda === "presencial" || v.enviado) return "Finalizado";
  return "Pendente";
}

function StatusBadge({ status }: { status: "Pendente" | "Finalizado" | "Cancelado" }) {
  const cfg = {
    Pendente:   { cls: "bg-amber-100 text-amber-700",  icon: <Clock size={10} /> },
    Finalizado: { cls: "bg-green-100 text-green-700",  icon: <CheckCircle size={10} /> },
    Cancelado:  { cls: "bg-red-100 text-red-600",      icon: <XCircle size={10} /> },
  };
  const { cls, icon } = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {icon} {status}
    </span>
  );
}

/* ─── Recibo Modal ─── */
function ReciboModal({ venda, onClose }: { venda: Venda; onClose: () => void }) {
  const status = getVendaStatus(venda);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 style={{ color: DARK }}>Recibo da Venda</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{venda.id} · {venda.data}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm"
            style={{ background: venda.tipoVenda === "presencial" ? WARM : venda.canalOnline === "whatsapp" ? "#f0fdf4" : "#EFF6FF" }}>
            {venda.tipoVenda === "presencial"
              ? <Store size={14} style={{ color: ACC }} />
              : venda.canalOnline === "whatsapp"
                ? <MessageCircle size={14} className="text-green-600" />
                : <Globe size={14} className="text-blue-600" />}
            <span className="text-xs font-medium"
              style={{ color: venda.tipoVenda === "presencial" ? ACC : venda.canalOnline === "whatsapp" ? "#16a34a" : "#2563eb" }}>
              {venda.tipoVenda === "presencial" ? "Venda Presencial" : venda.canalOnline === "whatsapp" ? "Venda WhatsApp" : "Venda pelo Site"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg" style={{ background: WARM }}>
              <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
              <p className="text-sm font-medium text-gray-800">{venda.cliente || "Não vinculado"}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: WARM }}>
              <p className="text-xs text-gray-400 mb-0.5">Pagamento</p>
              <p className="text-sm font-medium text-gray-800">{venda.pagamento}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Itens comprados</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-gray-400 border-b border-gray-50" style={{ background: "#F9F9F9" }}>
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qtd.</div>
                <div className="col-span-2 text-right">Unit.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {venda.itens.filter((i) => i.quantidade > 0).map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="col-span-6">
                    <p className="text-xs font-medium text-gray-800 leading-tight">{item.nome}</p>
                    {item.volume && <span className="text-xs text-gray-400">{item.volume}</span>}
                  </div>
                  <div className="col-span-2 text-xs text-gray-600 text-center">{item.quantidade}</div>
                  <div className="col-span-2 text-xs text-gray-600 text-right">R${item.valorUnitario.toFixed(2)}</div>
                  <div className="col-span-2 text-xs font-medium text-right" style={{ color: DARK }}>
                    R${(item.valorUnitario * item.quantidade).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 py-3 border-t border-gray-100">
            {venda.desconto !== undefined && venda.desconto > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span className="flex items-center gap-1"><Tag size={12} /> Desconto</span>
                <span>- R$ {venda.desconto.toFixed(2).replace(".", ",")}</span>
              </div>
            )}
            {venda.tipoVenda === "online" && venda.frete !== undefined && venda.frete > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>R$ {(venda.total - venda.frete + (venda.desconto ?? 0)).toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Truck size={13} className="text-blue-400" /> Frete</span>
                  <span>R$ {venda.frete.toFixed(2).replace(".", ",")}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total da venda</span>
              <span className="text-lg font-semibold" style={{ color: ACC }}>
                R$ {venda.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full px-4 py-2 rounded-lg text-sm text-white hover:opacity-90" style={{ background: ACC }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal — apenas Status e Pagamento são editáveis ─── */
function EditModal({ venda, onClose, onSave }: { venda: Venda; onClose: () => void; onSave: (v: Venda) => void }) {
  const [pagamento, setPagamento] = useState(venda.pagamento);

  const initialStatus: "Pendente" | "Finalizado" | "Cancelado" = venda.cancelada
    ? "Cancelado"
    : (venda.tipoVenda === "presencial" || venda.enviado) ? "Finalizado" : "Pendente";
  const [novoStatus, setNovoStatus] = useState<"Pendente" | "Finalizado" | "Cancelado">(initialStatus);

  // Presencial só pode ser Finalizado ou Cancelado
  const statusOpcoes: Array<"Pendente" | "Finalizado" | "Cancelado"> =
    venda.tipoVenda === "online" ? ["Pendente", "Finalizado", "Cancelado"] : ["Finalizado", "Cancelado"];

  const statusCfg: Record<"Pendente" | "Finalizado" | "Cancelado", { active: string; base: string; icon: React.ReactNode }> = {
    Pendente:   { active: "border-amber-400 text-amber-700 bg-amber-50",  base: "border-gray-200 text-gray-500 hover:border-gray-300", icon: <Clock size={13} /> },
    Finalizado: { active: "border-green-500 text-green-700 bg-green-50",  base: "border-gray-200 text-gray-500 hover:border-gray-300", icon: <CheckCircle size={13} /> },
    Cancelado:  { active: "border-red-400 text-red-600 bg-red-50",        base: "border-gray-200 text-gray-500 hover:border-gray-300", icon: <XCircle size={13} /> },
  };

  const handleSave = () => {
    const cancelada = novoStatus === "Cancelado";
    const enviado   = venda.tipoVenda === "online" ? novoStatus === "Finalizado" : false;
    onSave({ ...venda, pagamento, cancelada, enviado });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 style={{ color: DARK }}>Editar Venda</h3>
            <p className="text-xs text-gray-400 mt-0.5">{venda.id} · {venda.data}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>

        <div className="p-4 flex flex-col gap-5">
          {/* ── Dados exibidos (read-only) ── */}
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-50" style={{ background: "#fafaf9" }}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dados da venda</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              {/* Canal — fixo, não editável */}
              <div className="p-2.5 rounded-lg" style={{ background: WARM }}>
                <p className="text-xs text-gray-400 mb-1">Canal</p>
                <div className="flex items-center gap-1.5">
                  <CanalBadge venda={venda} />
                </div>
              </div>
              {/* Cliente */}
              <div className="p-2.5 rounded-lg" style={{ background: WARM }}>
                <p className="text-xs text-gray-400 mb-1">Cliente</p>
                <p className="text-sm font-medium text-gray-800 truncate">{venda.cliente || "—"}</p>
              </div>
              {/* Total */}
              <div className="p-2.5 rounded-lg" style={{ background: WARM }}>
                <p className="text-xs text-gray-400 mb-1">Valor total</p>
                <p className="text-sm font-medium" style={{ color: DARK }}>R$ {venda.total.toFixed(2).replace(".", ",")}</p>
              </div>
              {/* Frete */}
              {venda.tipoVenda === "online" && (
                <div className="p-2.5 rounded-lg" style={{ background: WARM }}>
                  <p className="text-xs text-gray-400 mb-1">Frete</p>
                  <p className="text-sm text-gray-700">
                    {venda.frete ? `R$ ${venda.frete.toFixed(2).replace(".", ",")}` : "—"}
                  </p>
                </div>
              )}
              {/* Desconto */}
              {venda.desconto && venda.desconto > 0 && (
                <div className="p-2.5 rounded-lg bg-green-50">
                  <p className="text-xs text-gray-400 mb-1">Desconto aplicado</p>
                  <p className="text-sm font-medium text-green-700">- R$ {venda.desconto.toFixed(2).replace(".", ",")}</p>
                </div>
              )}
            </div>

            {/* Itens (read-only) */}
            <div className="border-t border-gray-50">
              <div className="px-3 py-2 border-b border-gray-50" style={{ background: "#fafaf9" }}>
                <p className="text-xs text-gray-400">Itens da venda</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-36 overflow-y-auto">
                {venda.itens.filter(i => i.quantidade > 0).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-xs text-gray-700">{item.nome} {item.volume && <span className="text-gray-400">({item.volume})</span>}</p>
                      <p className="text-xs text-gray-400">×{item.quantidade}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-600">R$ {(item.valorUnitario * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Campos editáveis ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-gray-100" />
              <p className="text-xs text-gray-400 uppercase tracking-wide">Campos editáveis</p>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">Status da venda *</label>
              <div className="flex gap-2">
                {statusOpcoes.map((s) => (
                  <button key={s} onClick={() => setNovoStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all flex-1 justify-center ${novoStatus === s ? statusCfg[s].active : statusCfg[s].base}`}>
                    {statusCfg[s].icon} {s}
                  </button>
                ))}
              </div>
              {novoStatus === "Pendente" && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <Clock size={11} /> Este pedido voltará para Pedidos Online como pendente.
                </p>
              )}
              {novoStatus === "Cancelado" && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <XCircle size={11} /> A venda será marcada como cancelada.
                </p>
              )}
            </div>

            {/* Pagamento */}
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Tipo de pagamento *</label>
              <div className="relative">
                <select value={pagamento} onChange={(e) => setPagamento(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none appearance-none pr-8"
                  onFocus={e => e.target.style.borderColor = ACC}
                  onBlur={e => e.target.style.borderColor = ""}>
                  <option value="">Selecionar...</option>
                  {pagamentosOpcoes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Fechar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 flex items-center justify-center gap-2" style={{ background: ACC }}>
            <CheckCircle size={15} /> Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

type StatusFilter = "todos" | "finalizado" | "cancelado";

export function VendasHistorico() {
  const { vendas, updateVenda, currentUser } = useApp();
  const isAdmin = currentUser?.cargo === "Administrador";

  const [search, setSearch] = useState("");
  const [pagamentoFilter, setPagamentoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState<"todos" | "online" | "presencial">("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const [editVenda, setEditVenda] = useState<Venda | null>(null);

  const vendasExibidas = vendas.filter((v) => getVendaStatus(v) !== "Pendente");
  const finalizadas = vendasExibidas.filter((v) => getVendaStatus(v) === "Finalizado");
  const canceladas  = vendasExibidas.filter((v) => getVendaStatus(v) === "Cancelado");
  const totalFaturamento = finalizadas.reduce((acc, v) => acc + v.total, 0);

  const filtered = vendasExibidas.filter((v) => {
    const st = getVendaStatus(v);
    if (statusFilter === "finalizado" && st !== "Finalizado") return false;
    if (statusFilter === "cancelado"  && st !== "Cancelado")  return false;
    const matchSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
    const matchPag  = pagamentoFilter === "todos" || v.pagamento === pagamentoFilter;
    const matchTipo = tipoFilter === "todos" || v.tipoVenda === tipoFilter;
    return matchSearch && matchPag && matchTipo;
  });

  const handleSaveEdit = (updated: Venda) => { updateVenda(updated); setEditVenda(null); };

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {viewVenda && <ReciboModal venda={viewVenda} onClose={() => setViewVenda(null)} />}
      {editVenda && <EditModal venda={editVenda} onClose={() => setEditVenda(null)} onSave={handleSaveEdit} />}

      <div className="mb-5">
        <h1 style={{ color: DARK }}>Histórico de Vendas</h1>
        <nav className="text-xs text-gray-400 mt-0.5">Vendas &rsaquo; <span style={{ color: ACC }}>Histórico</span></nav>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">Total de vendas</p>
          <p className="text-2xl font-semibold mt-1" style={{ color: DARK }}>{vendasExibidas.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">Finalizadas</p>
          <p className="text-2xl font-semibold mt-1 text-green-600">{finalizadas.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">Canceladas</p>
          <p className="text-2xl font-semibold mt-1 text-red-500">{canceladas.length}</p>
        </div>
        {isAdmin && (
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-xs text-gray-500">Faturamento</p>
            <p className="text-xl font-semibold mt-1" style={{ color: ACC }}>
              R$ {totalFaturamento.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input type="text" placeholder="Buscar venda ou cliente..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none flex-1 text-gray-800 placeholder:text-gray-400" />
        </div>
        <select value={pagamentoFilter} onChange={(e) => setPagamentoFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none sm:w-44"
          onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
          <option value="todos">Todos os pagamentos</option>
          {pagamentosOpcoes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 self-start">
          {(["todos", "presencial", "online"] as const).map((key) => (
            <button key={key} onClick={() => setTipoFilter(key)}
              className="px-3 py-2 text-xs transition-all"
              style={tipoFilter === key ? { background: ACC, color: "white" } : { background: "white", color: "#4b5563" }}>
              {key === "todos" ? "Todos" : key === "presencial" ? "Presencial" : "Online (WA/Site)"}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 self-start">
          {([
            { key: "todos" as StatusFilter, label: "Todos" },
            { key: "finalizado" as StatusFilter, label: "Finalizado" },
            { key: "cancelado" as StatusFilter, label: "Cancelado" },
          ]).map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className="px-3 py-2 text-xs transition-all"
              style={statusFilter === key ? { background: ACC, color: "white" } : { background: "white", color: "#4b5563" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "#fafaf9" }}>
                {["Venda", "Data", "Cliente", "Canal", "Pagamento", "Status", "Valor Total", ...(isAdmin ? ["Ações"] : [])].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Nenhuma venda encontrada.</td></tr>
              ) : filtered.map((venda) => {
                const status = getVendaStatus(venda);
                return (
                  <tr key={venda.id} className={`hover:bg-gray-50/50 transition-colors ${status === "Cancelado" ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3"><span className="text-sm font-mono font-medium text-gray-700">{venda.id}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{venda.data}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{venda.cliente || <span className="text-gray-400 italic">—</span>}</td>
                    <td className="px-4 py-3"><CanalBadge venda={venda} /></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">{venda.pagamento}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={status} /></td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: DARK }}>R$ {venda.total.toFixed(2).replace(".", ",")}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewVenda(venda)} className="p-1.5 rounded-lg text-gray-400 transition-colors hover:bg-gray-100" title="Ver recibo"><Eye size={15} /></button>
                          <button onClick={() => setEditVenda(venda)} className="p-1.5 rounded-lg text-gray-400 transition-colors hover:bg-gray-100" title="Editar"><Pencil size={15} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50"><p className="text-xs text-gray-400">{filtered.length} venda(s)</p></div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((venda) => {
          const status = getVendaStatus(venda);
          return (
            <div key={venda.id} className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${status === "Cancelado" ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{venda.id}</span>
                  <StatusBadge status={status} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setViewVenda(venda)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"><Eye size={15} /></button>
                  {isAdmin && <button onClick={() => setEditVenda(venda)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"><Pencil size={15} /></button>}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800">{venda.cliente || <span className="text-gray-400 italic">Sem cliente</span>}</p>
              <div className="flex items-center gap-2 mt-1 mb-2 flex-wrap">
                <CanalBadge venda={venda} />
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{venda.pagamento}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-xs text-gray-400">{venda.data}</p>
                  {venda.tipoVenda === "online" && venda.frete !== undefined && venda.frete > 0 && (
                    <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5"><Truck size={11} /> Frete: R$ {venda.frete.toFixed(2)}</p>
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: ACC }}>R$ {venda.total.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">Nenhuma venda encontrada.</div>
        )}
      </div>
    </div>
  );
}
