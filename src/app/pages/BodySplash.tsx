import { useState } from "react";
import { Plus, Download, Pencil, X, CheckCircle, Search, Sparkles, Trash2 } from "lucide-react";

/* ─── Brand accent ─── */
const ACC = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";

interface BodySplashItem {
  id: number;
  produto: string;       // body splash product name (e.g. "Lavanda & Ylang")
  preco10ml: number;
  preco15ml: number;
  preco20ml: number;
  preco25ml: number;
  preco30ml: number;
}

const bodySplashBase = [
  "Lavanda & Ylang",
  "Rosa & Baunilha",
  "Flor de Laranjeira",
  "Coco & Baunilha",
  "Frutas Vermelhas",
  "Gardênia & Jasmim",
  "Bambu & Chá Verde",
  "Pêssego & Mel",
];

const initialItems: BodySplashItem[] = [
  { id: 1, produto: "Lavanda & Ylang",     preco10ml: 8.00,  preco15ml: 11.00, preco20ml: 14.00, preco25ml: 17.00, preco30ml: 20.00 },
  { id: 2, produto: "Rosa & Baunilha",     preco10ml: 8.00,  preco15ml: 11.00, preco20ml: 14.00, preco25ml: 17.00, preco30ml: 20.00 },
  { id: 3, produto: "Flor de Laranjeira",  preco10ml: 9.00,  preco15ml: 12.00, preco20ml: 15.00, preco25ml: 18.00, preco30ml: 22.00 },
];

const VOLUMES: Array<{ key: keyof Omit<BodySplashItem, "id" | "produto">; label: string }> = [
  { key: "preco10ml", label: "10ml" },
  { key: "preco15ml", label: "15ml" },
  { key: "preco20ml", label: "20ml" },
  { key: "preco25ml", label: "25ml" },
  { key: "preco30ml", label: "30ml" },
];

interface ModalProps {
  onClose: () => void;
  onSave: (d: Omit<BodySplashItem, "id">) => void;
  edit?: BodySplashItem;
}

function BodySplashModal({ onClose, onSave, edit }: ModalProps) {
  const [produto, setProduto] = useState(edit?.produto ?? "");
  const [precos, setPrecos] = useState<Record<string, string>>({
    preco10ml: String(edit?.preco10ml ?? ""),
    preco15ml: String(edit?.preco15ml ?? ""),
    preco20ml: String(edit?.preco20ml ?? ""),
    preco25ml: String(edit?.preco25ml ?? ""),
    preco30ml: String(edit?.preco30ml ?? ""),
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!produto) { setError("Selecione um Body Splash."); return; }
    const allFilled = VOLUMES.every(v => precos[v.key] && parseFloat(precos[v.key]) > 0);
    if (!allFilled) { setError("Preencha todos os preços."); return; }
    setError("");
    setSuccess(true);
    onSave({
      produto,
      preco10ml: parseFloat(precos.preco10ml),
      preco15ml: parseFloat(precos.preco15ml),
      preco20ml: parseFloat(precos.preco20ml),
      preco25ml: parseFloat(precos.preco25ml),
      preco30ml: parseFloat(precos.preco30ml),
    });
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 style={{ color: DARK }}>{edit ? "Editar Body Splash" : "Cadastrar Body Splash"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle size={16} /> Body Splash salvo com sucesso!
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Produto */}
          <div>
            <label className="text-sm text-gray-700 block mb-1.5">Body Splash vinculado *</label>
            <select value={produto} onChange={(e) => setProduto(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
              style={{ outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = ACC}
              onBlur={(e) => e.target.style.borderColor = ""}>
              <option value="">Selecionar Body Splash...</option>
              {bodySplashBase.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Selecione o produto base vinculado aos frascos.</p>
          </div>

          {/* Preços */}
          <div>
            <label className="text-sm text-gray-700 block mb-3">Preços por volumetria (R$) *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VOLUMES.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">Frasco {label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input type="number" min={0} step={0.01} value={precos[key]}
                      onChange={(e) => setPrecos(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="0,00"
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 focus:outline-none"
                      onFocus={(e) => e.target.style.borderColor = ACC}
                      onBlur={(e) => e.target.style.borderColor = ""} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90" style={{ background: ACC }}>
            {edit ? "Salvar alterações" : "Cadastrar Body Splash"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm Delete ─── */
function DeleteConfirm({ nome, onClose, onConfirm }: { nome: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 style={{ color: DARK }}>Excluir Body Splash</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir o body splash{" "}
            <strong className="text-gray-800">"{nome}"</strong>?
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700">Excluir</button>
        </div>
      </div>
    </div>
  );
}

function exportCSV(items: BodySplashItem[]) {
  const headers = ["ID", "Body Splash", "10ml", "15ml", "20ml", "25ml", "30ml"];
  const rows = items.map(d => [d.id, d.produto, d.preco10ml.toFixed(2), d.preco15ml.toFixed(2), d.preco20ml.toFixed(2), d.preco25ml.toFixed(2), d.preco30ml.toFixed(2)]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tabela-bodysplash.csv"; a.click();
  URL.revokeObjectURL(url);
}

export function BodySplash() {
  const [items, setItems] = useState<BodySplashItem[]>(initialItems);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<BodySplashItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<BodySplashItem | null>(null);
  const [search, setSearch] = useState("");

  const filtered = items.filter(d => d.produto.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (data: Omit<BodySplashItem, "id">) => {
    if (editItem) {
      setItems(prev => prev.map(d => d.id === editItem.id ? { ...d, ...data } : d));
    } else {
      const newId = Math.max(...items.map(d => d.id), 0) + 1;
      setItems(prev => [...prev, { id: newId, ...data }]);
    }
    setEditItem(null); setShowModal(false);
  };

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {(showModal || editItem) && (
        <BodySplashModal
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
          edit={editItem ?? undefined}
        />
      )}
      {deleteItem && (
        <DeleteConfirm
          nome={deleteItem.produto}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => {
            setItems(prev => prev.filter(d => d.id !== deleteItem.id));
            setDeleteItem(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 style={{ color: DARK }}>Body Splash</h1>
          <p className="text-xs text-gray-400 mt-0.5">Precificação de frascos de body splash por volumetria</p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          <button onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exportar Tabela
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90"
            style={{ background: ACC }}>
            <Plus size={16} /> Cadastrar Body Splash
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border px-4 py-3 mb-4 flex items-start gap-3"
        style={{ background: `${ACC}12`, borderColor: `${ACC}30` }}>
        <Sparkles size={15} style={{ color: ACC }} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium" style={{ color: DARK }}>Tabela de Frascos — Body Splash</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Gerencie os preços por volumetria (10ml, 15ml, 20ml, 25ml e 30ml) de cada produto Body Splash. Cada produto deve ser vinculado a um body splash base do catálogo.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input type="text" placeholder="Buscar por nome do body splash..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none flex-1 text-gray-800 placeholder:text-gray-400" />
        </div>
      </div>

      {/* Table desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "#fafaf9" }}>
                {["Body Splash Vinculado", "Frasco 10ml", "Frasco 15ml", "Frasco 20ml", "Frasco 25ml", "Frasco 30ml", "Ações"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles size={32} className="text-gray-300" />
                      <p>Nenhum body splash cadastrado.</p>
                      <button onClick={() => setShowModal(true)} className="mt-1 text-xs px-3 py-1.5 rounded-lg text-white hover:opacity-90" style={{ background: ACC }}>
                        Cadastrar primeiro body splash
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${ACC}18` }}>
                        <Sparkles size={13} style={{ color: ACC }} />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{d.produto}</span>
                    </div>
                  </td>
                  {/* Sem destaque de cor em nenhuma coluna de preço */}
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco10ml)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco15ml)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco20ml)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco25ml)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco30ml)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditItem(d)}
                        className="p-1.5 rounded-lg text-gray-400 transition-colors"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${ACC}18`; (e.currentTarget as HTMLElement).style.color = ACC; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = ""; }}
                        title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteItem(d)}
                        className="p-1.5 rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">{filtered.length} body splash(es) cadastrado(s)</p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
            Nenhum body splash cadastrado.
          </div>
        ) : filtered.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${ACC}18` }}>
                  <Sparkles size={15} style={{ color: ACC }} />
                </div>
                <p className="text-sm font-medium text-gray-800">{d.produto}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditItem(d)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setDeleteItem(d)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {/* Todas as colunas com a mesma cor */}
            <div className="grid grid-cols-5 gap-2 p-2 rounded-lg" style={{ background: WARM }}>
              {VOLUMES.map(({ key, label }) => (
                <div key={key} className="text-center">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xs font-medium text-gray-700">R${(d[key] as number).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}