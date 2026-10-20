import type { useDecantsFacade } from "../facade/useDecantsFacade";
import { DecantModal } from "./DecantModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { exportCSV } from "../services/decants.service";
import { Download, Plus, Droplets, Search, Pencil, Trash2 } from "lucide-react";
import { ACC } from "../config/decants.config";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { PeractTableRoot, PeractTableHeader, PeractTableRow, PeractTableHead, PeractTableBody, PeractTableCell } from "../../../shared/components/peract-table";
import { PeractPaginationFooter } from "../../../shared/components/peract-pagination";
export function DecantsView({
  confirmDelete,
  perfumeOptions,
  isLoading,
  error,
  showModal,
  setShowModal,
  editDecant,
  setEditDecant,
  deleteDecant,
  setDeleteDecant,
  search,
  setSearch,
  submitSearch,
  currentPage,
  setCurrentPage,
  totalElements,
  totalPages,
  firstItem,
  lastItem,
  filtered,
  handleSave,
  fmt,
  canManagePrices,
}: ReturnType<typeof useDecantsFacade> & { canManagePrices: boolean }) {
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {canManagePrices && (showModal || editDecant) && <DecantModal onClose={() => {
      setShowModal(false);
      setEditDecant(null);
    }} onSave={handleSave} perfumeOptions={perfumeOptions} edit={editDecant ?? undefined} />}
      {canManagePrices && deleteDecant && <DeleteConfirm nome={deleteDecant.perfume} onClose={() => setDeleteDecant(null)} onConfirm={confirmDelete} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 data-tour="tour-decants-header" className="peract-font-color-default">Decants</h1>
          <p className="text-xs peract-font-color-muted mt-0.5">Precificação e vinculação de decants por volumetria</p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          <PeractButtonPrimitive onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-4 py-2 rounded-lg border peract-border-color text-sm text-gray-700 hover:bg-gray-50 transition-colors" variant="plain" size="plain">
            <Download size={15} /> Exportar Tabela
          </PeractButtonPrimitive>
          {canManagePrices && <PeractButtonPrimitive onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 peract-bg-primary" variant="plain" size="plain">
            <Plus size={16} /> Cadastrar Decant
          </PeractButtonPrimitive>}
        </div>
      </div>

      {/* Info banner */}
      <div data-tour="tour-decants-table" className="rounded-xl border px-4 py-3 mb-4 flex items-start gap-3" style={{
      background: `${ACC}12`,
      borderColor: `${ACC}30`
    }}>
        <Droplets size={15} className="mt-0.5 shrink-0 peract-font-color-accent" />
        <div>
          <p className="text-sm font-medium peract-font-color-default">Tabela de Frascos — Decants</p>
          <p className="text-xs peract-font-color-muted mt-0.5">
            Gerencie os preços por volumetria (2ml, 3ml, 5ml e 10ml) de cada perfume disponível para decant. Cada linha representa um perfume base vinculado aos seus respectivos frascos.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}
      {isLoading && <p className="text-sm peract-font-color-muted mb-4">Carregando decants...</p>}

      {/* Search */}
      <PeractCard data-tour="tour-decants-search" className="peract-bg-card rounded-xl border peract-border-color p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-2 border peract-border-color rounded-lg px-3 py-2 max-w-sm">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="search" placeholder="Buscar por perfume..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={event => {
          if (event.key === "Enter") void submitSearch();
        }} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
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
                {["Perfume Vinculado", "Preço 2ml", "Preço 3ml", "Preço 5ml", "Preço 10ml", "Ações"].map(h => <PeractTableHead key={h} className="text-left px-4 py-3 text-xs font-medium peract-font-color-muted">{h}</PeractTableHead>)}
              </PeractTableRow>
            </PeractTableHeader>
            <PeractTableBody className="divide-y divide-gray-50">
              {filtered.length === 0 ? <PeractTableRow>
                  <PeractTableCell colSpan={6} className="text-center py-16 peract-font-color-muted text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Droplets size={32} className="text-gray-300" />
                      <p>Nenhum decant cadastrado.</p>
                      {canManagePrices && <PeractButtonPrimitive onClick={() => setShowModal(true)} className="mt-1 text-xs px-3 py-1.5 rounded-lg text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
                        Cadastrar primeiro decant
                      </PeractButtonPrimitive>}
                    </div>
                  </PeractTableCell>
                </PeractTableRow> : filtered.map(d => <PeractTableRow key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <PeractTableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{
                    background: `${ACC}18`
                  }}>
                        <Droplets size={13} className="peract-font-color-accent" />
                      </div>
                      <span className="max-w-[18rem] truncate text-sm font-medium peract-font-color-default" title={d.perfume}>{d.perfume}</span>
                    </div>
                  </PeractTableCell>
                  {/* Sem destaque de cor em nenhuma coluna de preço */}
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco2ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco3ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco5ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco10ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3">
                    {canManagePrices && <div className="flex items-center gap-1">
                      <PeractButtonPrimitive onClick={() => setEditDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-gray-100" title="Editar" variant="plain" size="plain" aria-label="Editar">
                        <Pencil size={15} />
                      </PeractButtonPrimitive>
                      <PeractButtonPrimitive onClick={() => setDeleteDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Excluir" variant="plain" size="plain" aria-label="Excluir">
                        <Trash2 size={15} />
                      </PeractButtonPrimitive>
                    </div>}
                  </PeractTableCell>
                </PeractTableRow>)}
            </PeractTableBody>
          </PeractTableRoot>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <PeractPaginationFooter currentPage={currentPage} totalPages={totalPages} onPageChange={page => void setCurrentPage(page)} firstItem={firstItem} lastItem={lastItem} totalItems={totalElements}>decant(s)</PeractPaginationFooter>
        </div>
      </PeractCard>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map(d => <PeractCard key={d.id} className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
              background: `${ACC}18`
            }}>
                  <Droplets size={15} className="peract-font-color-accent" />
                </div>
                <p className="min-w-0 truncate text-sm font-medium peract-font-color-default" title={d.perfume}>{d.perfume}</p>
              </div>
              {canManagePrices && <div className="flex items-center gap-1">
                <PeractButtonPrimitive onClick={() => setEditDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100" variant="plain" size="plain" aria-label="Editar">
                  <Pencil size={15} />
                </PeractButtonPrimitive>
                <PeractButtonPrimitive onClick={() => setDeleteDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-red-50 hover:text-red-600" variant="plain" size="plain" aria-label="Excluir">
                  <Trash2 size={15} />
                </PeractButtonPrimitive>
              </div>}
            </div>
            {/* Todas as colunas com a mesma cor */}
            <div className="grid grid-cols-4 gap-2 mt-2 p-2 rounded-lg peract-bg-accent-soft">
              {[{
            vol: "2ml",
            val: d.preco2ml
          }, {
            vol: "3ml",
            val: d.preco3ml
          }, {
            vol: "5ml",
            val: d.preco5ml
          }, {
            vol: "10ml",
            val: d.preco10ml
          }].map(({
            vol,
            val
          }) => <div key={vol} className="text-center">
                  <p className="text-xs peract-font-color-muted">{vol}</p>
                  <p className="text-xs font-medium text-gray-700">R${val.toFixed(0)}</p>
                </div>)}
            </div>
          </PeractCard>)}
        {filtered.length === 0 && <PeractCard className="text-center py-12 peract-font-color-muted text-sm peract-bg-card rounded-xl border peract-border-color">
            Nenhum decant cadastrado.
          </PeractCard>}
      </div>
      <PeractPaginationFooter className="mt-4 md:hidden" currentPage={currentPage} totalPages={totalPages} onPageChange={page => void setCurrentPage(page)} firstItem={firstItem} lastItem={lastItem} totalItems={totalElements}>decant(s)</PeractPaginationFooter>
    </div>;
}
