import type { useOnlineOrdersFacade } from "../facade/useOnlineOrdersFacade";
import { ReciboModal } from "./ReciboModal";
import { CancelModal } from "./CancelModal";
import { RastreioModal } from "./RastreioModal";
import { ACC } from "../config/online-orders.config";
import { Package } from "lucide-react";
import { PeractCard } from "../../../shared/components/peract-card";
import { Clock } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Search } from "lucide-react";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { PeractTableRoot } from "../../../shared/components/peract-table";
import { PeractTableHeader } from "../../../shared/components/peract-table";
import { PeractTableRow } from "../../../shared/components/peract-table";
import { PeractTableHead } from "../../../shared/components/peract-table";
import { PeractTableBody } from "../../../shared/components/peract-table";
import { PeractTableCell } from "../../../shared/components/peract-table";
import { CanalBadge } from "./CanalBadge";
import { StatusBadge } from "./StatusBadge";
import { Eye } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { XCircle } from "lucide-react";
import { Truck } from "lucide-react";

export function OnlineOrdersView({ pedidosOnline, search, setSearch, filtroStatus, setFiltroStatus, filtroCanal, setFiltroCanal, viewVenda, setViewVenda, cancelVenda, setCancelVenda, rastreioVenda, setRastreioVenda, handleFinalizar, confirmarRastreio, confirmarCancelamento, pendentes, finalizados, filtered }: ReturnType<typeof useOnlineOrdersFacade>) {
return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {viewVenda && <ReciboModal venda={viewVenda} onClose={() => setViewVenda(null)} />}
      {cancelVenda && <CancelModal venda={cancelVenda} onClose={() => setCancelVenda(null)} onConfirm={confirmarCancelamento} />}
      {rastreioVenda && <RastreioModal venda={rastreioVenda} onClose={() => setRastreioVenda(null)} onConfirm={confirmarRastreio} />}

      <div className="mb-5">
        <h1 className="peract-font-color-default">Pedidos Online</h1>
        <nav className="text-xs peract-font-color-muted mt-0.5">
          Vendas &rsaquo; <span className="peract-font-color-accent">Pedidos Online</span>
        </nav>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border mb-5 text-sm peract-font-color-default" style={{
      background: `${ACC}12`,
      borderColor: `${ACC}40`
    }}>
        <Package size={16} className="shrink-0 peract-font-color-accent" />
        <span>
          <strong>{pendentes} pedido(s)</strong> aguardando finalização. Pedidos
          pelo WhatsApp solicitarão o código de rastreio ao finalizar.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 shadow-sm text-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 bg-amber-100">
            <Clock size={16} className="text-amber-700" />
          </div>
          <p className="text-2xl font-semibold text-amber-700">{pendentes}</p>
          <p className="text-xs peract-font-color-muted">Pedidos Pendentes</p>
        </PeractCard>
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 shadow-sm text-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 bg-green-100">
            <CheckCircle size={16} className="text-green-700" />
          </div>
          <p className="text-2xl font-semibold text-green-700">{finalizados}</p>
          <p className="text-xs peract-font-color-muted">Pedidos Finalizados</p>
        </PeractCard>
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 shadow-sm text-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1" style={{
          background: `${ACC}18`
        }}>
            <Package size={16} className="peract-font-color-accent" />
          </div>
          <p className="text-2xl font-semibold peract-font-color-default">
            {pedidosOnline.length}
          </p>
          <p className="text-xs peract-font-color-muted">Total de Pedidos</p>
        </PeractCard>
      </div>

      {/* Filters */}
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 border peract-border-color rounded-lg px-3 py-2">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="text" placeholder="Buscar pedido ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border peract-border-color self-start">
            {[{
            key: "todos" as const,
            label: "Todos"
          }, {
            key: "pendente" as const,
            label: "Pendentes"
          }, {
            key: "finalizado" as const,
            label: "Finalizados"
          }].map(({
            key,
            label
          }) => <PeractButtonPrimitive key={key} onClick={() => setFiltroStatus(key)} className="px-3 py-2 text-xs transition-all" style={filtroStatus === key ? {
            background: ACC,
            color: "white"
          } : {
            background: "white",
            color: "#4b5563"
          }} variant="plain" size="plain">
                {label}
              </PeractButtonPrimitive>)}
          </div>
          <div className="flex rounded-lg overflow-hidden border peract-border-color self-start">
            {[{
            key: "todos" as const,
            label: "Todos canais"
          }, {
            key: "whatsapp" as const,
            label: "WhatsApp"
          }, {
            key: "site" as const,
            label: "Site"
          }].map(({
            key,
            label
          }) => <PeractButtonPrimitive key={key} onClick={() => setFiltroCanal(key)} className="px-3 py-2 text-xs transition-all" style={filtroCanal === key ? {
            background: "#1a1a1a",
            color: "white"
          } : {
            background: "white",
            color: "#4b5563"
          }} variant="plain" size="plain">
                {label}
              </PeractButtonPrimitive>)}
          </div>
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
                {["Pedido", "Canal", "Cliente", "Data", "Itens", "Frete", "Valor Total", "Status", "Ações"].map(h => <PeractTableHead key={h} className="text-left px-4 py-3 text-xs font-medium peract-font-color-muted">
                    {h}
                  </PeractTableHead>)}
              </PeractTableRow>
            </PeractTableHeader>
            <PeractTableBody className="divide-y divide-gray-50">
              {filtered.length === 0 ? <PeractTableRow>
                  <PeractTableCell colSpan={9} className="text-center py-12 peract-font-color-muted text-sm">
                    Nenhum pedido encontrado.
                  </PeractTableCell>
                </PeractTableRow> : filtered.map(pedido => <PeractTableRow key={pedido.id} className={`hover:bg-gray-50/50 transition-colors ${pedido.enviado ? "opacity-70" : ""}`}>
                    <PeractTableCell className="px-4 py-3 text-sm font-mono font-medium text-gray-700">
                      {pedido.id}
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3">
                      <CanalBadge canal={pedido.canalOnline} />
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm font-medium peract-font-color-default">
                      {pedido.cliente || "—"}
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm text-gray-600">
                      {pedido.data}
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm text-gray-600">
                      {pedido.itens.filter(i => i.quantidade > 0).reduce((a, i) => a + i.quantidade, 0)}{" "}
                      itens
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm text-blue-500">
                      {pedido.frete !== undefined && pedido.frete > 0 ? `R$ ${pedido.frete.toFixed(2).replace(".", ",")}` : <span className="text-gray-300">—</span>}
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm font-medium peract-font-color-default">
                      R$ {pedido.total.toFixed(2).replace(".", ",")}
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3">
                      <div>
                        <StatusBadge finalizado={!!pedido.enviado} />
                        {pedido.enviado && pedido.dataEnvio && <p className="text-xs peract-font-color-muted mt-0.5">
                            {pedido.dataEnvio}
                          </p>}
                        {pedido.codigoRastreio && <p className="text-xs text-green-600 font-mono mt-0.5">
                            {pedido.codigoRastreio}
                          </p>}
                      </div>
                    </PeractTableCell>
                    <PeractTableCell className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <PeractButtonPrimitive onClick={() => setViewVenda(pedido)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100 transition-colors" title="Ver pedido" variant="plain" size="plain" aria-label="Ver pedido">
                          <Eye size={14} />
                        </PeractButtonPrimitive>
                        {!pedido.enviado ? <PeractButtonPrimitive onClick={() => handleFinalizar(pedido)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white font-medium hover:opacity-90 transition-all" style={{
                    background: pedido.canalOnline === "whatsapp" ? "#22c55e" : ACC
                  }} variant="plain" size="plain">
                            {pedido.canalOnline === "whatsapp" ? <MessageCircle size={13} /> : <CheckCircle size={13} />}
                            Finalizar
                          </PeractButtonPrimitive> : <PeractButtonPrimitive onClick={() => handleFinalizar(pedido)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-50 peract-border-color-accent peract-font-color-accent" variant="plain" size="plain">
                            <RotateCcw size={13} /> Desfazer
                          </PeractButtonPrimitive>}
                        <PeractButtonPrimitive onClick={() => setCancelVenda(pedido)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-all" title="Cancelar pedido" variant="plain" size="plain" aria-label="Cancelar pedido">
                          <XCircle size={13} /> Cancelar
                        </PeractButtonPrimitive>
                      </div>
                    </PeractTableCell>
                  </PeractTableRow>)}
            </PeractTableBody>
          </PeractTableRoot>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs peract-font-color-muted">
            {filtered.length} pedido(s) online
          </p>
        </div>
      </PeractCard>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map(pedido => <div key={pedido.id} className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${pedido.enviado ? "opacity-80" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-mono peract-font-color-muted">
                  {pedido.id}
                </span>
                <p className="text-sm font-medium peract-font-color-default">
                  {pedido.cliente || "—"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <PeractButtonPrimitive onClick={() => setViewVenda(pedido)} className="p-1 rounded-lg peract-font-color-muted hover:bg-gray-100" variant="plain" size="plain" aria-label="Ver detalhes">
                  <Eye size={15} />
                </PeractButtonPrimitive>
                <CanalBadge canal={pedido.canalOnline} />
                <StatusBadge finalizado={!!pedido.enviado} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs peract-font-color-muted">{pedido.data}</span>
                {pedido.frete !== undefined && pedido.frete > 0 && <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                    <Truck size={11} /> Frete: R${" "}
                    {pedido.frete.toFixed(2).replace(".", ",")}
                  </p>}
                {pedido.codigoRastreio && <p className="text-xs text-green-600 font-mono mt-0.5">
                    Rastreio: {pedido.codigoRastreio}
                  </p>}
              </div>
              <span className="text-sm font-medium peract-font-color-default">
                R$ {pedido.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex gap-2">
              {!pedido.enviado ? <PeractButtonPrimitive onClick={() => handleFinalizar(pedido)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-white hover:opacity-90" style={{
            background: pedido.canalOnline === "whatsapp" ? "#22c55e" : ACC
          }} variant="plain" size="plain">
                  {pedido.canalOnline === "whatsapp" ? <MessageCircle size={14} /> : <CheckCircle size={14} />}
                  Finalizar
                </PeractButtonPrimitive> : <PeractButtonPrimitive onClick={() => handleFinalizar(pedido)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 peract-border-color-accent peract-font-color-accent" variant="plain" size="plain">
                  <RotateCcw size={14} /> Desfazer
                </PeractButtonPrimitive>}
              <PeractButtonPrimitive onClick={() => setCancelVenda(pedido)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50" variant="plain" size="plain">
                <XCircle size={14} /> Cancelar
              </PeractButtonPrimitive>
            </div>
          </div>)}
        {filtered.length === 0 && <div className="text-center py-12 peract-font-color-muted text-sm">
            Nenhum pedido online encontrado.
          </div>}
      </div>
    </div>;
}
