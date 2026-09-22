import { PeractField } from "../../shared/components/peract-field";
import { PeractTableCell } from "../../shared/components/peract-table";
import { PeractTableBody } from "../../shared/components/peract-table";
import { PeractTableHead } from "../../shared/components/peract-table";
import { PeractTableRow } from "../../shared/components/peract-table";
import { PeractTableHeader } from "../../shared/components/peract-table";
import { PeractTableRoot } from "../../shared/components/peract-table";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractInputControl } from "../../shared/components/peract-input";
import { PeractNativeSelect } from "../../shared/components/peract-select";
import { PeractLabel } from "../../shared/components/peract-label";
import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { PeractModal } from "../../shared/components/peract-modal";
import { PeractModalTitle } from "../../shared/components/peract-modal";
import { useState } from "react";
import { Plus, Download, Pencil, X, CheckCircle, Search, Sparkles, Trash2 } from "lucide-react";

/* ─── Brand accent ─── */
const ACC = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";
interface BodySplashItem {
  id: number;
  produto: string; // body splash product name (e.g. "Lavanda & Ylang")
  preco10ml: number;
  preco15ml: number;
  preco20ml: number;
  preco25ml: number;
  preco30ml: number;
}
const bodySplashBase = ["Lavanda & Ylang", "Rosa & Baunilha", "Flor de Laranjeira", "Coco & Baunilha", "Frutas Vermelhas", "Gardênia & Jasmim", "Bambu & Chá Verde", "Pêssego & Mel"];
const initialItems: BodySplashItem[] = [{
  id: 1,
  produto: "Lavanda & Ylang",
  preco10ml: 8.00,
  preco15ml: 11.00,
  preco20ml: 14.00,
  preco25ml: 17.00,
  preco30ml: 20.00
}, {
  id: 2,
  produto: "Rosa & Baunilha",
  preco10ml: 8.00,
  preco15ml: 11.00,
  preco20ml: 14.00,
  preco25ml: 17.00,
  preco30ml: 20.00
}, {
  id: 3,
  produto: "Flor de Laranjeira",
  preco10ml: 9.00,
  preco15ml: 12.00,
  preco20ml: 15.00,
  preco25ml: 18.00,
  preco30ml: 22.00
}];
const VOLUMES: Array<{
  key: keyof Omit<BodySplashItem, "id" | "produto">;
  label: string;
}> = [{
  key: "preco10ml",
  label: "10ml"
}, {
  key: "preco15ml",
  label: "15ml"
}, {
  key: "preco20ml",
  label: "20ml"
}, {
  key: "preco25ml",
  label: "25ml"
}, {
  key: "preco30ml",
  label: "30ml"
}];
interface ModalProps {
  onClose: () => void;
  onSave: (d: Omit<BodySplashItem, "id">) => void;
  edit?: BodySplashItem;
}
function BodySplashModal({
  onClose,
  onSave,
  edit
}: ModalProps) {
  const [produto, setProduto] = useState(edit?.produto ?? "");
  const [precos, setPrecos] = useState<Record<string, string>>({
    preco10ml: String(edit?.preco10ml ?? ""),
    preco15ml: String(edit?.preco15ml ?? ""),
    preco20ml: String(edit?.preco20ml ?? ""),
    preco25ml: String(edit?.preco25ml ?? ""),
    preco30ml: String(edit?.preco30ml ?? "")
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const handleSave = () => {
    if (!produto) {
      setError("Selecione um Body Splash.");
      return;
    }
    const allFilled = VOLUMES.every(v => precos[v.key] && parseFloat(precos[v.key]) > 0);
    if (!allFilled) {
      setError("Preencha todos os preços.");
      return;
    }
    setError("");
    setSuccess(true);
    onSave({
      produto,
      preco10ml: parseFloat(precos.preco10ml),
      preco15ml: parseFloat(precos.preco15ml),
      preco20ml: parseFloat(precos.preco20ml),
      preco25ml: parseFloat(precos.preco25ml),
      preco30ml: parseFloat(precos.preco30ml)
    });
    setTimeout(onClose, 1200);
  };
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card">
          <PeractModalTitle className="peract-font-color-default">{edit ? "Editar Body Splash" : "Cadastrar Body Splash"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle size={16} /> Body Splash salvo com sucesso!
            </div>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Produto */}
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">Body Splash vinculado *</PeractLabel>
            <PeractNativeSelect value={produto} onChange={e => setProduto(e.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none" style={{
          outline: "none"
        }} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
              <option value="">Selecionar Body Splash...</option>
              {bodySplashBase.map(p => <option key={p} value={p}>{p}</option>)}
            </PeractNativeSelect>
            <p className="text-xs peract-font-color-muted mt-1">Selecione o produto base vinculado aos frascos.</p>
          </PeractField>

          {/* Preços */}
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-3">Preços por volumetria (R$) *</PeractLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VOLUMES.map(({
            key,
            label
          }) => <PeractField key={key}>
                  <PeractLabel className="text-xs peract-font-color-muted block mb-1">Frasco {label}</PeractLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 peract-font-color-muted text-sm">R$</span>
                    <PeractInputControl type="number" min={0} step={0.01} value={precos[key]} onChange={e => setPrecos(p => ({
                ...p,
                [key]: e.target.value
              }))} placeholder="0,00" className="w-full border peract-border-color rounded-lg pl-8 pr-3 py-2 text-sm peract-font-color-default focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""} />
                  </div>
                </PeractField>)}
            </div>
          </PeractField>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            {edit ? "Salvar alterações" : "Cadastrar Body Splash"}
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}

/* ─── Confirm Delete ─── */
function DeleteConfirm({
  nome,
  onClose,
  onConfirm
}: {
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={onClose}>
        <div className="p-4 border-b peract-border-color">
          <PeractModalTitle className="peract-font-color-default">Excluir Body Splash</PeractModalTitle>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir o body splash{" "}
            <strong className="peract-font-color-default">"{nome}"</strong>?
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700" variant="plain" size="plain">Excluir</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
function exportCSV(items: BodySplashItem[]) {
  const headers = ["ID", "Body Splash", "10ml", "15ml", "20ml", "25ml", "30ml"];
  const rows = items.map(d => [d.id, d.produto, d.preco10ml.toFixed(2), d.preco15ml.toFixed(2), d.preco20ml.toFixed(2), d.preco25ml.toFixed(2), d.preco30ml.toFixed(2)]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tabela-bodysplash.csv";
  a.click();
  URL.revokeObjectURL(url);
}
function BodySplashPage() {
  const [items, setItems] = useState<BodySplashItem[]>(initialItems);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<BodySplashItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<BodySplashItem | null>(null);
  const [search, setSearch] = useState("");
  const filtered = items.filter(d => d.produto.toLowerCase().includes(search.toLowerCase()));
  const handleSave = (data: Omit<BodySplashItem, "id">) => {
    if (editItem) {
      setItems(prev => prev.map(d => d.id === editItem.id ? {
        ...d,
        ...data
      } : d));
    } else {
      const newId = Math.max(...items.map(d => d.id), 0) + 1;
      setItems(prev => [...prev, {
        id: newId,
        ...data
      }]);
    }
    setEditItem(null);
    setShowModal(false);
  };
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {(showModal || editItem) && <BodySplashModal onClose={() => {
      setShowModal(false);
      setEditItem(null);
    }} onSave={handleSave} edit={editItem ?? undefined} />}
      {deleteItem && <DeleteConfirm nome={deleteItem.produto} onClose={() => setDeleteItem(null)} onConfirm={() => {
      setItems(prev => prev.filter(d => d.id !== deleteItem.id));
      setDeleteItem(null);
    }} />}

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
export { BodySplashPage };
