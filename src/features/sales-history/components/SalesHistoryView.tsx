import type { useSalesHistoryFacade } from "../facade/useSalesHistoryFacade";
import { ReciboModal } from "./ReciboModal";
import { EditModal } from "./EditModal";
import { PeractCard } from "../../../shared/components/peract-card";
import { Search, Eye, Pencil, Truck } from "lucide-react";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
import { ACC, pagamentosOpcoes } from "../config/sales-history.config";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import type { StatusFilter } from "../models/sales-history.models";
import { PeractTableRoot, PeractTableHeader, PeractTableRow, PeractTableHead, PeractTableBody, PeractTableCell } from "../../../shared/components/peract-table";
import { getVendaStatus } from "../services/sales-history.service";
import { CanalBadge } from "./CanalBadge";
import { PeractTag } from "../../../shared/components/peract-tag";
import { StatusBadge } from "./StatusBadge";
import { PeractPagination } from "../../../shared/components/peract-pagination";
export function SalesHistoryView({
  isAdmin,
  isLoading,
  error,
  currentPage,
  setCurrentPage,
  totalPages,
  paginatedSales,
  firstSaleOnPage,
  lastSaleOnPage,
  search,
  setSearch,
  pagamentoFilter,
  setPagamentoFilter,
  tipoFilter,
  setTipoFilter,
  statusFilter,
  setStatusFilter,
  viewVenda,
  setViewVenda,
  editVenda,
  setEditVenda,
  vendasExibidas,
  finalizadas,
  canceladas,
  totalFaturamento,
  filtered,
  handleSaveEdit
}: ReturnType<typeof useSalesHistoryFacade>) {
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto" id="sales-history-section">
      {viewVenda && <ReciboModal venda={viewVenda} onClose={() => setViewVenda(null)} />}
      {editVenda && <EditModal venda={editVenda} onClose={() => setEditVenda(null)} onSave={handleSaveEdit} />}

      <div className="mb-5">
        <h1 className="peract-font-color-default">Histórico de Vendas</h1>
        <nav className="text-xs peract-font-color-muted mt-0.5">Vendas &rsaquo; <span className="peract-font-color-accent">Histórico</span></nav>
      </div>

      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div> : null}
      {isLoading ? <p className="mb-4 text-sm peract-font-color-muted">Carregando histórico de vendas...</p> : null}

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
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm flex-wrap">
        <div className="flex h-12 items-center gap-2 flex-1 min-w-[180px] border peract-border-color rounded-lg px-3 py-1">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="text" placeholder="Buscar venda ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
        </div>
        <PeractNativeSelect value={pagamentoFilter} onChange={e => setPagamentoFilter(e.target.value)} className="h-10 border peract-border-color rounded-lg px-3 py-1 text-sm text-gray-700 focus:outline-none sm:w-44" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
          <option value="todos">Todos os pagamentos</option>
          {pagamentosOpcoes.map(p => <option key={p} value={p}>{p}</option>)}
        </PeractNativeSelect>
        <div className="flex rounded-lg overflow-hidden border peract-border-color">
          {(["todos", "presencial", "online"] as const).map(key => <PeractButtonPrimitive key={key} onClick={() => setTipoFilter(key)} className="px-3 py-1.5 text-xs transition-all" style={tipoFilter === key ? {
          background: ACC,
          color: "white"
        } : {
          background: "white",
          color: "#4b5563"
        }} variant="plain" size="plain">
              {key === "todos" ? "Todos" : key === "presencial" ? "Presencial" : "Online (WA/Site)"}
            </PeractButtonPrimitive>)}
        </div>
        <div className="flex rounded-lg overflow-hidden border peract-border-color">
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
        }) => <PeractButtonPrimitive key={key} onClick={() => setStatusFilter(key)} className="px-3 py-1.5 text-xs transition-all" style={statusFilter === key ? {
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
              {filtered.length === 0 ? <PeractTableRow><PeractTableCell colSpan={8} className="text-center py-12 peract-font-color-muted text-sm">Nenhuma venda encontrada.</PeractTableCell></PeractTableRow> : paginatedSales.map(venda => {
              const status = getVendaStatus(venda);
              return <PeractTableRow key={venda.id} className={`hover:bg-gray-50/50 transition-colors ${status === "Cancelado" ? "opacity-60" : ""}`}>
                    <PeractTableCell className="px-4 py-3"><span className="text-sm font-mono font-medium text-gray-700">{venda.id}</span></PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm text-gray-600">{venda.data}</PeractTableCell>
                    <PeractTableCell className="px-4 py-3 text-sm font-medium peract-font-color-default max-w-[16rem] truncate" title={venda.cliente}>{venda.cliente || <span className="peract-font-color-muted italic">—</span>}</PeractTableCell>
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
        <div className="px-4 py-3 border-t border-gray-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs peract-font-color-muted">Exibindo {firstSaleOnPage} a {lastSaleOnPage} de {filtered.length} venda(s)</p>
            <PeractPagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      </PeractCard>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {paginatedSales.map(venda => {
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
              <p className="text-sm font-medium peract-font-color-default truncate" title={venda.cliente}>{venda.cliente || <span className="peract-font-color-muted italic">Sem cliente</span>}</p>
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
      <div className="mt-4 md:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs peract-font-color-muted">Exibindo {firstSaleOnPage} a {lastSaleOnPage} de {filtered.length} venda(s)</p>
          <PeractPagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>;
}
