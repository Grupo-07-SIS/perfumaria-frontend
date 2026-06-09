import { useState } from "react";
import {
  Package,
  Truck,
  RotateCcw,
  Search,
  Clock,
  Eye,
  X,
  Globe,
  CheckCircle,
  XCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Venda } from "../context/AppContext";
import { triggerBotpressOnlineFlow } from "../services/botpress";

const ACC = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";

function CanalBadge({ canal }: { canal?: "whatsapp" | "site" }) {
  if (canal === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <MessageCircle size={10} /> WhatsApp
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <Globe size={10} /> Site
    </span>
  );
}

function StatusBadge({ finalizado }: { finalizado: boolean }) {
  if (finalizado) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle size={10} /> Finalizado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <Clock size={10} /> Pendente
    </span>
  );
}

/* ─── Tracking Code Modal (WhatsApp only) ─── */
function RastreioModal({
  venda,
  onClose,
  onConfirm,
}: {
  venda: Venda;
  onClose: () => void;
  onConfirm: (codigo: string) => void;
}) {
  const [codigo, setCodigo] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Código de Rastreio
              </p>
              <p className="text-xs text-gray-400">
                Pedido {venda.id} · WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Informe o código de rastreio para finalizar o pedido. Ele ficará
            registrado e visível no recibo.
          </p>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium tracking-wide uppercase">
            Código de rastreio
          </label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: BR123456789BR"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400 transition-colors font-mono"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Deixe em branco para finalizar sem código de rastreio.
          </p>
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(codigo.trim())}
            className="flex-1 px-4 py-2 rounded-lg text-sm text-white font-medium flex items-center justify-center gap-1.5 hover:opacity-90"
            style={{ background: "#22c55e" }}
          >
            <Send size={14} /> Finalizar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function ReciboModal({
  venda,
  onClose,
}: {
  venda: Venda;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 style={{ color: DARK }}>Pedido Online</h3>
              <StatusBadge finalizado={!!venda.enviado} />
              <CanalBadge canal={venda.canalOnline} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {venda.id} · {venda.data}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg" style={{ background: WARM }}>
              <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
              <p className="text-sm font-medium text-gray-800">
                {venda.cliente || "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: WARM }}>
              <p className="text-xs text-gray-400 mb-0.5">Pagamento</p>
              <p className="text-sm font-medium text-gray-800">
                {venda.pagamento}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              Itens
            </p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div
                className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-gray-400 border-b border-gray-50"
                style={{ background: "#fafaf9" }}
              >
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qtd.</div>
                <div className="col-span-2 text-right">Unit.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {venda.itens
                .filter((i) => i.quantidade > 0)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="col-span-6">
                      <p className="text-xs font-medium text-gray-800 leading-tight">
                        {item.nome}
                      </p>
                      {item.volume && (
                        <span className="text-xs text-gray-400">
                          {item.volume}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-xs text-gray-600 text-center">
                      {item.quantidade}
                    </div>
                    <div className="col-span-2 text-xs text-gray-600 text-right">
                      R${item.valorUnitario.toFixed(2)}
                    </div>
                    <div
                      className="col-span-2 text-xs font-medium text-right"
                      style={{ color: DARK }}
                    >
                      R${(item.valorUnitario * item.quantidade).toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 py-3 border-t border-gray-100">
            {venda.frete !== undefined && venda.frete > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>
                    R${" "}
                    {(venda.total - venda.frete).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-blue-500">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} /> Frete
                  </span>
                  <span>R$ {venda.frete.toFixed(2).replace(".", ",")}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-lg font-semibold" style={{ color: ACC }}>
                R$ {venda.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          {venda.enviado && venda.dataEnvio && (
            <div className="mt-3 flex flex-col gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} /> Finalizado em {venda.dataEnvio}
              </div>
              {venda.codigoRastreio && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Package size={13} />
                  <span>
                    Rastreio:{" "}
                    <span className="font-mono font-medium">
                      {venda.codigoRastreio}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg text-sm text-white hover:opacity-90"
            style={{ background: ACC }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm Cancel Modal ─── */
function CancelModal({
  venda,
  onClose,
  onConfirm,
}: {
  venda: Venda;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <h3 style={{ color: DARK }}>Cancelar Pedido</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-1">
            Tem certeza que deseja cancelar o pedido{" "}
            <strong className="text-gray-800 font-mono">{venda.id}</strong>?
          </p>
          <p className="text-xs text-gray-400">
            Cliente:{" "}
            <span className="text-gray-600">
              {venda.cliente || "Não vinculado"}
            </span>{" "}
            · Total:{" "}
            <span className="text-gray-600">
              R$ {venda.total.toFixed(2).replace(".", ",")}
            </span>
          </p>
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <Clock size={11} /> O pedido aparecerá no Histórico de Vendas como
            cancelado.
          </p>
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Fechar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1.5"
          >
            <XCircle size={14} /> Cancelar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

export function PedidosOnline() {
  const { vendas, updateVendaEnvio, updateVenda } = useApp();

  const pedidosOnline = vendas.filter(
    (v) => v.tipoVenda === "online" && !v.cancelada,
  );

  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "pendente" | "finalizado"
  >("pendente");
  const [filtroCanal, setFiltroCanal] = useState<"todos" | "whatsapp" | "site">(
    "todos",
  );
  const [viewVenda, setViewVenda] = useState<Venda | null>(null);
  const [cancelVenda, setCancelVenda] = useState<Venda | null>(null);
  const [rastreioVenda, setRastreioVenda] = useState<Venda | null>(null);

  const hoje = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const triggerOnlineFinalizationFlow = async (
    venda: Venda,
    codigoRastreio?: string,
  ) => {
    if (!venda.canalOnline) return;

    const desconto = venda.desconto ?? 0;
    const frete = venda.frete ?? 0;
    const subtotal = venda.total - frete + desconto;

    await triggerBotpressOnlineFlow({
      codigoVenda: venda.id,
      nomeCliente: venda.cliente,
      emailCliente: venda.emailCliente || undefined,
      dadosPedido: venda.itens.map((item) => ({
        ...item,
        totalItem: item.valorUnitario * item.quantidade,
      })),
      frete: venda.frete,
      desconto: desconto > 0 ? desconto : undefined,
      subtotal,
      totalVenda: venda.total,
      formaPagamento: venda.pagamento,
      dataHoraPedido: venda.data,
      canalVenda: venda.canalOnline,
      codigoRastreio:
        venda.canalOnline === "whatsapp" ? codigoRastreio : undefined,
    });
  };

  const handleFinalizar = async (venda: Venda) => {
    if (venda.enviado) {
      // desfazer
      updateVendaEnvio(venda.id, false);
    } else if (venda.canalOnline === "whatsapp") {
      setRastreioVenda(venda);
    } else {
      updateVendaEnvio(venda.id, true, hoje());
      try {
        await triggerOnlineFinalizationFlow(venda);
      } catch (error) {
        console.error(
          "Erro ao acionar fluxo de venda online no Botpress",
          error,
        );
      }
    }
  };

  const confirmarRastreio = async (codigo: string) => {
    if (!rastreioVenda) return;
    updateVendaEnvio(rastreioVenda.id, true, hoje(), codigo || undefined);
    try {
      await triggerOnlineFinalizationFlow(rastreioVenda, codigo || undefined);
    } catch (error) {
      console.error("Erro ao acionar fluxo de venda online no Botpress", error);
    }
    setRastreioVenda(null);
  };

  const confirmarCancelamento = () => {
    if (!cancelVenda) return;
    updateVenda({ ...cancelVenda, cancelada: true, enviado: false });
    setCancelVenda(null);
  };

  const pendentes = pedidosOnline.filter((p) => !p.enviado).length;
  const finalizados = pedidosOnline.filter((p) => p.enviado).length;

  const filtered = pedidosOnline.filter((p) => {
    const matchSearch =
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "pendente" && !p.enviado) ||
      (filtroStatus === "finalizado" && p.enviado);
    const matchCanal = filtroCanal === "todos" || p.canalOnline === filtroCanal;
    return matchSearch && matchStatus && matchCanal;
  });

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {viewVenda && (
        <ReciboModal venda={viewVenda} onClose={() => setViewVenda(null)} />
      )}
      {cancelVenda && (
        <CancelModal
          venda={cancelVenda}
          onClose={() => setCancelVenda(null)}
          onConfirm={confirmarCancelamento}
        />
      )}
      {rastreioVenda && (
        <RastreioModal
          venda={rastreioVenda}
          onClose={() => setRastreioVenda(null)}
          onConfirm={confirmarRastreio}
        />
      )}

      <div className="mb-5">
        <h1 style={{ color: DARK }}>Pedidos Online</h1>
        <nav className="text-xs text-gray-400 mt-0.5">
          Vendas &rsaquo; <span style={{ color: ACC }}>Pedidos Online</span>
        </nav>
      </div>

      {/* Info banner */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg border mb-5 text-sm"
        style={{ background: `${ACC}12`, borderColor: `${ACC}40`, color: DARK }}
      >
        <Package size={16} style={{ color: ACC }} className="shrink-0" />
        <span>
          <strong>{pendentes} pedido(s)</strong> aguardando finalização. Pedidos
          pelo WhatsApp solicitarão o código de rastreio ao finalizar.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 bg-amber-100">
            <Clock size={16} className="text-amber-700" />
          </div>
          <p className="text-2xl font-semibold text-amber-700">{pendentes}</p>
          <p className="text-xs text-gray-500">Pedidos Pendentes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 bg-green-100">
            <CheckCircle size={16} className="text-green-700" />
          </div>
          <p className="text-2xl font-semibold text-green-700">{finalizados}</p>
          <p className="text-xs text-gray-500">Pedidos Finalizados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1"
            style={{ background: `${ACC}18` }}
          >
            <Package size={16} style={{ color: ACC }} />
          </div>
          <p className="text-2xl font-semibold" style={{ color: DARK }}>
            {pedidosOnline.length}
          </p>
          <p className="text-xs text-gray-500">Total de Pedidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar pedido ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none flex-1 text-gray-800 placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 self-start">
            {[
              { key: "todos" as const, label: "Todos" },
              { key: "pendente" as const, label: "Pendentes" },
              { key: "finalizado" as const, label: "Finalizados" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFiltroStatus(key)}
                className="px-3 py-2 text-xs transition-all"
                style={
                  filtroStatus === key
                    ? { background: ACC, color: "white" }
                    : { background: "white", color: "#4b5563" }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 self-start">
            {[
              { key: "todos" as const, label: "Todos canais" },
              { key: "whatsapp" as const, label: "WhatsApp" },
              { key: "site" as const, label: "Site" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFiltroCanal(key)}
                className="px-3 py-2 text-xs transition-all"
                style={
                  filtroCanal === key
                    ? { background: "#1a1a1a", color: "white" }
                    : { background: "white", color: "#4b5563" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "#fafaf9" }}>
                {[
                  "Pedido",
                  "Canal",
                  "Cliente",
                  "Data",
                  "Itens",
                  "Frete",
                  "Valor Total",
                  "Status",
                  "Ações",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((pedido) => (
                  <tr
                    key={pedido.id}
                    className={`hover:bg-gray-50/50 transition-colors ${pedido.enviado ? "opacity-70" : ""}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-700">
                      {pedido.id}
                    </td>
                    <td className="px-4 py-3">
                      <CanalBadge canal={pedido.canalOnline} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {pedido.cliente || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pedido.data}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pedido.itens
                        .filter((i) => i.quantidade > 0)
                        .reduce((a, i) => a + i.quantidade, 0)}{" "}
                      itens
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-500">
                      {pedido.frete !== undefined && pedido.frete > 0 ? (
                        `R$ ${pedido.frete.toFixed(2).replace(".", ",")}`
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-medium"
                      style={{ color: DARK }}
                    >
                      R$ {pedido.total.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <StatusBadge finalizado={!!pedido.enviado} />
                        {pedido.enviado && pedido.dataEnvio && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {pedido.dataEnvio}
                          </p>
                        )}
                        {pedido.codigoRastreio && (
                          <p className="text-xs text-green-600 font-mono mt-0.5">
                            {pedido.codigoRastreio}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => setViewVenda(pedido)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                          title="Ver pedido"
                        >
                          <Eye size={14} />
                        </button>
                        {!pedido.enviado ? (
                          <button
                            onClick={() => handleFinalizar(pedido)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white font-medium hover:opacity-90 transition-all"
                            style={{
                              background:
                                pedido.canalOnline === "whatsapp"
                                  ? "#22c55e"
                                  : ACC,
                            }}
                          >
                            {pedido.canalOnline === "whatsapp" ? (
                              <MessageCircle size={13} />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            Finalizar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFinalizar(pedido)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-50"
                            style={{ borderColor: ACC, color: ACC }}
                          >
                            <RotateCcw size={13} /> Desfazer
                          </button>
                        )}
                        <button
                          onClick={() => setCancelVenda(pedido)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                          title="Cancelar pedido"
                        >
                          <XCircle size={13} /> Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            {filtered.length} pedido(s) online
          </p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((pedido) => (
          <div
            key={pedido.id}
            className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${pedido.enviado ? "opacity-80" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-mono text-gray-400">
                  {pedido.id}
                </span>
                <p className="text-sm font-medium text-gray-800">
                  {pedido.cliente || "—"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <button
                  onClick={() => setViewVenda(pedido)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <Eye size={15} />
                </button>
                <CanalBadge canal={pedido.canalOnline} />
                <StatusBadge finalizado={!!pedido.enviado} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-gray-400">{pedido.data}</span>
                {pedido.frete !== undefined && pedido.frete > 0 && (
                  <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                    <Truck size={11} /> Frete: R${" "}
                    {pedido.frete.toFixed(2).replace(".", ",")}
                  </p>
                )}
                {pedido.codigoRastreio && (
                  <p className="text-xs text-green-600 font-mono mt-0.5">
                    Rastreio: {pedido.codigoRastreio}
                  </p>
                )}
              </div>
              <span className="text-sm font-medium" style={{ color: DARK }}>
                R$ {pedido.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex gap-2">
              {!pedido.enviado ? (
                <button
                  onClick={() => handleFinalizar(pedido)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-white hover:opacity-90"
                  style={{
                    background:
                      pedido.canalOnline === "whatsapp" ? "#22c55e" : ACC,
                  }}
                >
                  {pedido.canalOnline === "whatsapp" ? (
                    <MessageCircle size={14} />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  Finalizar
                </button>
              ) : (
                <button
                  onClick={() => handleFinalizar(pedido)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: ACC, color: ACC }}
                >
                  <RotateCcw size={14} /> Desfazer
                </button>
              )}
              <button
                onClick={() => setCancelVenda(pedido)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle size={14} /> Cancelar
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Nenhum pedido online encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
