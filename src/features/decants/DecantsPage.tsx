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
import { Plus, Download, Pencil, X, CheckCircle, Droplets, Search, Trash2 } from "lucide-react";
const ACC = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";
interface Decant {
  id: number;
  perfume: string;
  preco2ml: number;
  preco3ml: number;
  preco5ml: number;
  preco10ml: number;
}
const perfumesBase = ["Chanel N°5", "Dior Sauvage", "YSL Libre", "Creed Aventus", "Tom Ford Black Orchid", "Hermès Terre d'Hermès", "Bvlgari Omnia"];
const initialDecants: Decant[] = [{
  id: 1,
  perfume: "Chanel N°5",
  preco2ml: 12.00,
  preco3ml: 17.00,
  preco5ml: 25.00,
  preco10ml: 45.00
}, {
  id: 2,
  perfume: "Dior Sauvage",
  preco2ml: 14.00,
  preco3ml: 19.00,
  preco5ml: 28.00,
  preco10ml: 50.00
}, {
  id: 3,
  perfume: "YSL Libre",
  preco2ml: 13.00,
  preco3ml: 18.00,
  preco5ml: 26.00,
  preco10ml: 47.00
}, {
  id: 4,
  perfume: "Creed Aventus",
  preco2ml: 20.00,
  preco3ml: 28.00,
  preco5ml: 42.00,
  preco10ml: 78.00
}, {
  id: 5,
  perfume: "Tom Ford Black Orchid",
  preco2ml: 18.00,
  preco3ml: 25.00,
  preco5ml: 38.00,
  preco10ml: 70.00
}];
interface DecantModalProps {
  onClose: () => void;
  onSave: (d: Omit<Decant, "id">) => void;
  edit?: Decant;
}
function DecantModal({
  onClose,
  onSave,
  edit
}: DecantModalProps) {
  const [perfume, setPerfume] = useState(edit?.perfume ?? "");
  const [preco2ml, setPreco2ml] = useState(String(edit?.preco2ml ?? ""));
  const [preco3ml, setPreco3ml] = useState(String(edit?.preco3ml ?? ""));
  const [preco5ml, setPreco5ml] = useState(String(edit?.preco5ml ?? ""));
  const [preco10ml, setPreco10ml] = useState(String(edit?.preco10ml ?? ""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const handleSave = () => {
    if (!perfume) {
      setError("Selecione um perfume.");
      return;
    }
    if (!preco2ml || !preco3ml || !preco5ml || !preco10ml) {
      setError("Preencha todos os preços.");
      return;
    }
    setError("");
    setSuccess(true);
    onSave({
      perfume,
      preco2ml: parseFloat(preco2ml),
      preco3ml: parseFloat(preco3ml),
      preco5ml: parseFloat(preco5ml),
      preco10ml: parseFloat(preco10ml)
    });
    setTimeout(onClose, 1200);
  };
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card">
          <PeractModalTitle className="peract-font-color-default">{edit ? "Editar Decant" : "Cadastrar Decant"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle size={16} /> Decant salvo com sucesso!
            </div>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">Perfume vinculado *</PeractLabel>
            <PeractNativeSelect value={perfume} onChange={e => setPerfume(e.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
              <option value="">Selecionar perfume em estoque...</option>
              {perfumesBase.map(p => <option key={p} value={p}>{p}</option>)}
            </PeractNativeSelect>
            <p className="text-xs peract-font-color-muted mt-1">Apenas perfumes cadastrados são exibidos.</p>
          </PeractField>

          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-3">Preços por volumetria (R$) *</PeractLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{
            label: "2ml",
            val: preco2ml,
            set: setPreco2ml
          }, {
            label: "3ml",
            val: preco3ml,
            set: setPreco3ml
          }, {
            label: "5ml",
            val: preco5ml,
            set: setPreco5ml
          }, {
            label: "10ml",
            val: preco10ml,
            set: setPreco10ml
          }].map(({
            label,
            val,
            set
          }) => <PeractField key={label}>
                  <PeractLabel className="text-xs peract-font-color-muted block mb-1">Preço {label}</PeractLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 peract-font-color-muted text-sm">R$</span>
                    <PeractInputControl type="number" min={0} step={0.01} value={val} onChange={e => set(e.target.value)} placeholder="0,00" className="w-full border peract-border-color rounded-lg pl-8 pr-3 py-2 text-sm peract-font-color-default focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""} />
                  </div>
                </PeractField>)}
            </div>
          </PeractField>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            Salvar decant
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
          <PeractModalTitle className="peract-font-color-default">Excluir Decant</PeractModalTitle>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir o decant de{" "}
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
function exportCSV(decants: Decant[]) {
  const headers = ["ID", "Perfume", "Preço 2ml", "Preço 3ml", "Preço 5ml", "Preço 10ml"];
  const rows = decants.map(d => [d.id, d.perfume, d.preco2ml.toFixed(2), d.preco3ml.toFixed(2), d.preco5ml.toFixed(2), d.preco10ml.toFixed(2)]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tabela-decants.csv";
  a.click();
  URL.revokeObjectURL(url);
}
function DecantsPage() {
  const [decants, setDecants] = useState<Decant[]>(initialDecants);
  const [showModal, setShowModal] = useState(false);
  const [editDecant, setEditDecant] = useState<Decant | null>(null);
  const [deleteDecant, setDeleteDecant] = useState<Decant | null>(null);
  const [search, setSearch] = useState("");
  const filtered = decants.filter(d => d.perfume.toLowerCase().includes(search.toLowerCase()));
  const handleSave = (data: Omit<Decant, "id">) => {
    if (editDecant) {
      setDecants(prev => prev.map(d => d.id === editDecant.id ? {
        ...d,
        ...data
      } : d));
    } else {
      const newId = Math.max(...decants.map(d => d.id), 0) + 1;
      setDecants(prev => [...prev, {
        id: newId,
        ...data
      }]);
    }
    setEditDecant(null);
    setShowModal(false);
  };
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {(showModal || editDecant) && <DecantModal onClose={() => {
      setShowModal(false);
      setEditDecant(null);
    }} onSave={handleSave} edit={editDecant ?? undefined} />}
      {deleteDecant && <DeleteConfirm nome={deleteDecant.perfume} onClose={() => setDeleteDecant(null)} onConfirm={() => {
      setDecants(prev => prev.filter(d => d.id !== deleteDecant.id));
      setDeleteDecant(null);
    }} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="peract-font-color-default">Decants</h1>
          <p className="text-xs peract-font-color-muted mt-0.5">Precificação e vinculação de decants por volumetria</p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          <PeractButtonPrimitive onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-4 py-2 rounded-lg border peract-border-color text-sm text-gray-700 hover:bg-gray-50 transition-colors" variant="plain" size="plain">
            <Download size={15} /> Exportar Tabela
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            <Plus size={16} /> Cadastrar Decant
          </PeractButtonPrimitive>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border px-4 py-3 mb-4 flex items-start gap-3" style={{
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

      {/* Search */}
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-2 border peract-border-color rounded-lg px-3 py-2 max-w-sm">
          <Search size={15} className="peract-font-color-muted shrink-0" />
          <PeractInputControl type="text" placeholder="Buscar por perfume..." value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none flex-1 peract-font-color-default placeholder:text-gray-400" />
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
                      <PeractButtonPrimitive onClick={() => setShowModal(true)} className="mt-1 text-xs px-3 py-1.5 rounded-lg text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
                        Cadastrar primeiro decant
                      </PeractButtonPrimitive>
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
                      <span className="text-sm font-medium peract-font-color-default">{d.perfume}</span>
                    </div>
                  </PeractTableCell>
                  {/* Sem destaque de cor em nenhuma coluna de preço */}
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco2ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco3ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco5ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3 text-sm text-gray-700">{fmt(d.preco10ml)}</PeractTableCell>
                  <PeractTableCell className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <PeractButtonPrimitive onClick={() => setEditDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-gray-100" title="Editar" variant="plain" size="plain" aria-label="Editar">
                        <Pencil size={15} />
                      </PeractButtonPrimitive>
                      <PeractButtonPrimitive onClick={() => setDeleteDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Excluir" variant="plain" size="plain" aria-label="Excluir">
                        <Trash2 size={15} />
                      </PeractButtonPrimitive>
                    </div>
                  </PeractTableCell>
                </PeractTableRow>)}
            </PeractTableBody>
          </PeractTableRoot>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs peract-font-color-muted">{filtered.length} decant(s) cadastrado(s)</p>
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
                <p className="text-sm font-medium peract-font-color-default">{d.perfume}</p>
              </div>
              <div className="flex items-center gap-1">
                <PeractButtonPrimitive onClick={() => setEditDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-gray-100" variant="plain" size="plain" aria-label="Editar">
                  <Pencil size={15} />
                </PeractButtonPrimitive>
                <PeractButtonPrimitive onClick={() => setDeleteDecant(d)} className="p-1.5 rounded-lg peract-font-color-muted hover:bg-red-50 hover:text-red-600" variant="plain" size="plain" aria-label="Excluir">
                  <Trash2 size={15} />
                </PeractButtonPrimitive>
              </div>
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
    </div>;
}
export { DecantsPage };
