import type { useBodySplashFacade } from "../facade/useBodySplashFacade";
import { BodySplashModal } from "./BodySplashModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { exportCSV } from "../services/body-splash.service";
import { Download, Plus, Sparkles, Search, Pencil, Trash2 } from "lucide-react";

/* ─── Brand accent ─── */

/* ─── Brand accent ─── */
import { ACC, VOLUMES } from "../config/body-splash.config";
/* ─── Brand accent ─── */
import { PeractCard } from "../../../shared/components/peract-card";
/* ─── Brand accent ─── */
import { PeractInputControl } from "../../../shared/components/peract-input";
import { PeractTableRoot, PeractTableHeader, PeractTableRow, PeractTableHead, PeractTableBody, PeractTableCell } from "../../../shared/components/peract-table";
/* ─── Brand accent ─── */

export function BodySplashView({
  confirmDelete,
  productOptions,
  isLoading,
  error,
  showModal,
  setShowModal,
  editItem,
  setEditItem,
  deleteItem,
  setDeleteItem,
  search,
  setSearch,
  filtered,
  handleSave,
  fmt
}: ReturnType<typeof useBodySplashFacade>) {
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {(showModal || editItem) && <BodySplashModal onClose={() => {
      setShowModal(false);
      setEditItem(null);
    }} onSave={handleSave} productOptions={productOptions} edit={editItem ?? undefined} />}
      {deleteItem && <DeleteConfirm nome={deleteItem.produto} onClose={() => setDeleteItem(null)} onConfirm={confirmDelete} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="peract-font-color-default">Body Splash</h1>
          <p className="text-xs peract-font-color-muted mt-0.5">Precificação de frascos de body splash por volumetria</p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          <PeractButtonPrimitive onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-4 py-2 rounded-lg border peract-border-color text-sm text-gray-700 hover:bg-gray-50 transition-colors" variant="plain" size="plain">
            <Download size={15} /> Exportar Tabela
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            <Plus size={16} /> Cadastrar Body Splash
          </PeractButtonPrimitive>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border px-4 py-3 mb-4 flex items-start gap-3" style={{
      background: `${ACC}12`,
      borderColor: `${ACC}30`
    }}>
        <Sparkles size={15} className="mt-0.5 shrink-0 peract-font-color-accent" />
        <div>
          <p className="text-sm font-medium peract-font-color-default">Tabela de Frascos — Body Splash</p>
          <p className="text-xs peract-font-color-muted mt-0.5">
            Gerencie os preços por volumetria (10ml, 15ml, 20ml, 25ml e 30ml) de cada produto Body Splash. Cada produto deve ser vinculado a um body splash base do catálogo.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}
      {isLoading && <p className="text-sm peract-font-color-muted mb-4">Carregando preços de Body Splash...</p>}

      {/* Search */}
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-2 border peract-border-color rounded-lg px-3 py-2 max-w-sm">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="text" placeholder="Buscar por nome do body splash..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
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
                {["Body Splash Vinculado", "Frasco 10ml", "Frasco 15ml", "Frasco 20ml", "Frasco 25ml", "Frasco 30ml", "Ações"].map(h => <PeractTableHead key={h} className="text-left px-4 py-3 text-xs font-medium peract-font-color-muted whitespace-nowrap">{h}</PeractTableHead>)}
              </PeractTableRow>
            </PeractTableHeader>
            <PeractTableBody className="divide-y divide-gray-50">
              {filtered.length === 0 ? <PeractTableRow>
                  <PeractTableCell colSpan={7} className="text-center py-16 peract-font-color-muted text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles size={32} className="text-gray-300" />
                      <p>Nenhum body splash cadastrado.</p>
                      <PeractButtonPrimitive onClick={() => setShowModal(true)} className="mt-1 text-xs px-3 py-1.5 rounded-lg text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
                        Cadastrar primeiro body splash
                      </PeractButtonPrimitive>
                    </div>
                  </PeractTableCell>
                </PeractTableRow> : filtered.map(d => <PeractTableRow key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <PeractTableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{
                    background: `${ACC}18`
                  }}>
                        <Sparkles size={13} className="peract-font-color-accent" />
                      </div>
                      <span className="text-sm font-medium peract-font-color-default">{d.produto}</span>
                    </div>
                  </PeractTableCell>
                  {/* Sem destaque de cor em nenhuma coluna de preço */}
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco10ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco15ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco20ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco25ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco30ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <PeractButtonPrimitive onClick={() => setEditItem(d)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors" onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${ACC}18`;
                    (e.currentTarget as HTMLElement).style.color = ACC;
                  }} onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "";
                  }} title="Editar" variant="plain" size="plain" aria-label="Editar">
                        <Pencil size={15} />
                      </PeractButtonPrimitive>
                      <PeractButtonPrimitive onClick={() => setDeleteItem(d)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Excluir" variant="plain" size="plain" aria-label="Excluir">
                        <Trash2 size={15} />
                      </PeractButtonPrimitive>
                    </div>
                  </PeractTableCell>
                </PeractTableRow>)}
            </PeractTableBody>
          </PeractTableRoot>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs peract-font-color-muted">{filtered.length} body splash(es) cadastrado(s)</p>
        </div>
      </PeractCard>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? <PeractCard className="text-center py-12 peract-font-color-muted text-sm peract-bg-card rounded-xl border peract-border-color">
            Nenhum body splash cadastrado.
          </PeractCard> : filtered.map(d => <PeractCard key={d.id} className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
              background: `${ACC}18`
            }}>
                  <Sparkles size={15} className="peract-font-color-accent" />
                </div>
                <p className="text-sm font-medium peract-font-color-default">{d.produto}</p>
              </div>
              <div className="flex items-center gap-1">
                <PeractButtonPrimitive onClick={() => setEditItem(d)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100" variant="plain" size="plain" aria-label="Editar">
                  <Pencil size={15} />
                </PeractButtonPrimitive>
                <PeractButtonPrimitive onClick={() => setDeleteItem(d)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-red-50 hover:text-red-600" variant="plain" size="plain" aria-label="Excluir">
                  <Trash2 size={15} />
                </PeractButtonPrimitive>
              </div>
            </div>
            {/* Todas as colunas com a mesma cor */}
            <div className="grid grid-cols-5 gap-2 p-2 rounded-lg peract-bg-accent-soft">
              {VOLUMES.map(({
            key,
            label
          }) => <div key={key} className="text-center">
                  <p className="text-xs peract-font-color-muted">{label}</p>
                  <p className="text-xs font-medium text-gray-700">R${(d[key] as number).toFixed(0)}</p>
                </div>)}
            </div>
          </PeractCard>)}
      </div>
    </div>;
}
