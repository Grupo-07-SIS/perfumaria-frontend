import { useState } from "react";
import {
  Search, Plus, Edit3, ChevronUp, ChevronDown, X, CheckCircle,
  AlertCircle, Trash2, PackageX, Ruler, TrendingUp,
} from "lucide-react";
import { useApp, Product, StockStatus } from "../context/AppContext";
import { PeractButton } from "../../shared/components/peract-button";
import { PeractInput } from "../../shared/components/peract-input";

const statusConfig: Record<StockStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ok:       { label: "OK",       color: "#166534", bg: "#dcfce7", icon: <CheckCircle size={12} /> },
  critico:  { label: "Crítico",  color: "#92400e", bg: "#fef3c7", icon: <AlertCircle size={12} /> },
  esgotado: { label: "Esgotado", color: "#991b1b", bg: "#fee2e2", icon: <PackageX size={12} /> },
};

const UNIDADES = ["ml", "L", "g", "kg", "oz", "un"];

interface ProductModalProps {
  product?: Product;
  categories: string[];
  onClose: () => void;
  onSave: (data: Omit<Product, "id" | "status">) => void;
}

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? (categories[0] ?? ""));
  const [stock, setStock] = useState(String(product?.currentStock ?? "0"));
  const [preco, setPreco] = useState(product ? String(product.preco) : "");
  const [precoCompra, setPrecoCompra] = useState(product?.precoCompra ? String(product.precoCompra) : "");

  const [hasVolume, setHasVolume] = useState(!!(product?.volume));
  const [volumeVal, setVolumeVal] = useState(product?.volume ? String(product.volume) : "");
  const [tipoMedida, setTipoMedida] = useState(product?.tipoMedida ?? "ml");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const precoNum = parseFloat(preco) || 0;
  const precoCompraNum = parseFloat(precoCompra) || 0;
  const margem = precoNum > 0 && precoCompraNum > 0
    ? ((precoNum - precoCompraNum) / precoNum) * 100
    : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Obrigatório.";
    if (!preco || parseFloat(preco) <= 0) e.preco = "Informe um preço válido.";
    if (parseInt(stock) < 0 || isNaN(parseInt(stock))) e.stock = "Qtd. inválida.";
    if (hasVolume && (!volumeVal || parseFloat(volumeVal) <= 0)) e.volume = "Informe um volume válido.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSuccess(true);
    onSave({
      name: name.trim(),
      brand: brand.trim(),
      category: category || "Não vinculado",
      currentStock: parseInt(stock) || 0,
      preco: parseFloat(preco),
      precoCompra: precoCompra && parseFloat(precoCompra) > 0 ? parseFloat(precoCompra) : undefined,
      volume: hasVolume && volumeVal ? parseFloat(volumeVal) : undefined,
      tipoMedida: hasVolume ? tipoMedida : undefined,
    });
    setTimeout(onClose, 1200);
  };

  const allCategories = [...categories, "Não vinculado"].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-[#26221E]">{product ? "Editar Produto" : "Novo Produto"}</h3>
          <PeractButton action={onClose} className="h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {success && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" role="status">
              <CheckCircle size={16} /> {product ? "Produto atualizado!" : "Produto cadastrado!"}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="sm:col-span-2">
              <PeractInput type="text" value={name} onValueChange={(value) => { setName(value); setErrors({ ...errors, name: "" }); }}
                placeholder="Ex: Chanel N°5" autoFocus label="Nome do produto" required errorText={errors.name}
                validation={errors.name ? "invalid" : "non-validation"} />
            </div>

            {/* Marca */}
            <div>
              <PeractInput type="text" value={brand} onValueChange={setBrand} placeholder="Ex: Chanel" label="Marca" />
            </div>

            {/* Categoria */}
            <div>
              <label className="text-sm text-gray-700 block mb-1.5">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#A67449]">
                {allCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Estoque */}
            <div>
              <PeractInput type="number" min={0} value={stock} onValueChange={(value) => { setStock(value); setErrors({ ...errors, stock: "" }); }}
                label="Estoque atual" required errorText={errors.stock}
                validation={errors.stock ? "invalid" : "non-validation"} />
            </div>

            {/* Preço de venda */}
            <div>
              <PeractInput type="number" min={0} step={0.01} value={preco} placeholder="0,00"
                onValueChange={(value) => { setPreco(value); setErrors({ ...errors, preco: "" }); }}
                label="Preço de venda (R$)" required errorText={errors.preco}
                validation={errors.preco ? "invalid" : "non-validation"} />
            </div>

            {/* Preço de compra */}
            <div>
              <PeractInput type="number" min={0} step={0.01} value={precoCompra} placeholder="0,00"
                onValueChange={setPrecoCompra} label="Preço de compra (R$)" />
            </div>

            {/* Margem preview */}
            {margem !== null && (
              <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: margem >= 30 ? "#f0fdf4" : "#fef3c7", color: margem >= 30 ? "#166534" : "#92400e" }}>
                <TrendingUp size={12} />
                Margem de lucro estimada: <strong>{margem.toFixed(1)}%</strong>
                {margem < 20 && " · ⚠️ Margem baixa"}
              </div>
            )}
          </div>

          {/* Volume section */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="relative">
                <input type="checkbox" checked={hasVolume}
                  onChange={(e) => { setHasVolume(e.target.checked); if (!e.target.checked) { setVolumeVal(""); setErrors({ ...errors, volume: "" }); } }}
                  className="sr-only" />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${hasVolume ? "border-[#A67449]" : "border-gray-300"}`}
                  style={{ background: hasVolume ? "#A67449" : "white" }}>
                  {hasVolume && <CheckCircle size={12} className="text-white" />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">Deseja inserir volume</span>
              </div>
            </label>
            {hasVolume && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex flex-col gap-3" style={{ background: "#FAFAFA" }}>
                <p className="text-xs text-gray-400">Informe a capacidade do produto e a unidade de medida</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <PeractInput type="number" min={0} step={0.1} value={volumeVal} placeholder="Ex: 200"
                      onValueChange={(value) => { setVolumeVal(value); setErrors({ ...errors, volume: "" }); }}
                      label="Capacidade" required errorText={errors.volume}
                      validation={errors.volume ? "invalid" : "non-validation"} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-1.5">Tipo de medida *</label>
                    <select value={tipoMedida} onChange={(e) => setTipoMedida(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#A67449]">
                      {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                {volumeVal && tipoMedida && (
                  <div className="flex items-center gap-2 text-xs text-[#A67449] bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                    <Ruler size={11} /> Volume exibido: <strong>{volumeVal}{tipoMedida}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary">Cancelar</PeractButton>
          <PeractButton action={handleSave} className="flex-1">{product ? "Salvar alterações" : "Cadastrar produto"}</PeractButton>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-4 border-b border-gray-100"><h3 className="text-[#26221E]">Remover produto</h3></div>
        <div className="p-4">
          <p className="text-sm text-gray-600">Tem certeza que deseja remover <strong className="text-gray-800">"{name}"</strong>? Esta ação não pode ser desfeita.</p>
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary">Cancelar</PeractButton>
          <PeractButton action={onConfirm} className="flex-1 border-red-600 bg-red-600 text-white" theme="primary">Remover</PeractButton>
        </div>
      </div>
    </div>
  );
}

export function EstoqueProdutos() {
  const { products, addProduct, updateProduct, deleteProduct, categories, stockThresholds } = useApp();

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const categoryNames = ["Todos", ...categories.map((c) => c.nome)];

  const handleSort = (field: keyof Product) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleSaveEdit = (data: Omit<Product, "id" | "status">) => {
    if (editProduct) updateProduct({ ...editProduct, ...data });
    setEditProduct(null);
  };

  const handleSaveNew = (data: Omit<Product, "id" | "status">) => {
    addProduct(data);
    setShowNew(false);
  };

  const handleDelete = () => {
    if (deleteTarget) { deleteProduct(deleteTarget.id); setDeleteTarget(null); }
  };

  const filtered = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || p.status === statusFilter;
      const matchCat = activeCategory === "Todos" || p.category === activeCategory;
      return matchSearch && matchStatus && matchCat;
    })
    .sort((a, b) => {
      const valA = a[sortField]; const valB = b[sortField];
      if (typeof valA === "string" && typeof valB === "string") return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      if (typeof valA === "number" && typeof valB === "number") return sortAsc ? valA - valB : valB - valA;
      return 0;
    });

  const SortIcon = ({ field }: { field: keyof Product }) =>
    sortField === field
      ? sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronDown size={13} className="opacity-30" />;

  const volumeLabel = (p: Product) => p.volume && p.tipoMedida ? `${p.volume}${p.tipoMedida}` : null;

  const margemLabel = (p: Product) => {
    if (!p.precoCompra || p.precoCompra <= 0) return null;
    const pct = ((p.preco - p.precoCompra) / p.preco) * 100;
    return pct;
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {(editProduct || showNew) && (
        <ProductModal
          product={editProduct ?? undefined}
          categories={categories.map((c) => c.nome)}
          onClose={() => { setEditProduct(null); setShowNew(false); }}
          onSave={editProduct ? handleSaveEdit : handleSaveNew}
        />
      )}
      {deleteTarget && <DeleteConfirm name={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[#26221E]">Estoque – Produtos</h1>
          <nav className="text-xs text-gray-400 mt-0.5">Estoque &rsaquo; <span className="text-[#A67449]">Produtos</span></nav>
        </div>
        <PeractButton action={() => setShowNew(true)} className="self-start" icon={<Plus size={16} />}>Novo produto</PeractButton>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 bg-white px-3 py-2 rounded-lg border border-gray-100 w-fit shadow-sm">
        <AlertCircle size={13} className="text-amber-500" />
        Status Crítico: estoque ≤ <strong className="text-gray-600 mx-1">{stockThresholds.critico}</strong> · Esgotado quando = 0
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {categoryNames.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${activeCategory === cat ? "text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            style={activeCategory === cat ? { background: "#A67449" } : {}}>
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-400 shrink-0" />
          <PeractInput type="text" placeholder="Buscar por nome ou marca..." value={search} onValueChange={setSearch}
            className="border-0 bg-transparent px-0 py-0 shadow-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#A67449] sm:w-44">
          <option value="todos">Todos os status</option>
          <option value="ok">OK</option>
          <option value="critico">Crítico</option>
          <option value="esgotado">Esgotado</option>
        </select>
      </div>

      {/* Table desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "#F2F2F2" }}>
                {[
                  { label: "Produto",   field: "name"         as keyof Product },
                  { label: "Marca",     field: "brand"        as keyof Product },
                  { label: "Categoria", field: "category"     as keyof Product },
                  { label: "Volume",    field: "volume"       as keyof Product },
                  { label: "Estoque",   field: "currentStock" as keyof Product },
                  { label: "P. Venda",  field: "preco"        as keyof Product },
                  { label: "P. Compra", field: "precoCompra"  as keyof Product },
                  { label: "Margem",    field: "precoCompra"  as keyof Product },
                  { label: "Status",    field: "status"       as keyof Product },
                ].map(({ label, field }, idx) => (
                  <th key={`${field}-${idx}`}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-800 whitespace-nowrap"
                    onClick={() => handleSort(field)}>
                    <div className="flex items-center gap-1">{label}<SortIcon field={field} /></div>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400 text-sm">Nenhum produto encontrado.</td></tr>
              ) : filtered.map((p) => {
                const sc = statusConfig[p.status];
                const vol = volumeLabel(p);
                const margem = margemLabel(p);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.brand}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{p.category}</span></td>
                    <td className="px-4 py-3">
                      {vol
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium flex items-center gap-1 w-fit"><Ruler size={10} />{vol}</span>
                        : <span className="text-xs text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.currentStock}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">R$ {p.preco.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {p.precoCompra ? `R$ ${p.precoCompra.toFixed(2)}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {margem !== null
                        ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${margem >= 35 ? "bg-green-100 text-green-700" : margem >= 20 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                            {margem.toFixed(1)}%
                          </span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: sc.color, background: sc.bg }}>
                        {sc.icon}{sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PeractButton action={() => setEditProduct(p)} className="h-8 w-8 text-gray-400 hover:bg-amber-50 hover:text-amber-700" size="icon" theme="secondary" title="Editar"><Edit3 size={15} /></PeractButton>
                        <PeractButton action={() => setDeleteTarget(p)} className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600" size="icon" theme="secondary" title="Remover"><Trash2 size={15} /></PeractButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">Exibindo {filtered.length} de {products.length} produtos</p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">Nenhum produto encontrado.</div>
        ) : filtered.map((p) => {
          const sc = statusConfig[p.status];
          const vol = volumeLabel(p);
          const margem = margemLabel(p);
          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.brand} · {p.category}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ color: sc.color, background: sc.bg }}>
                  {sc.icon}{sc.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div><p className="text-xs text-gray-400">Estoque</p><p className="text-sm font-medium text-gray-800">{p.currentStock}</p></div>
                <div><p className="text-xs text-gray-400">P. Venda</p><p className="text-sm text-gray-700">R$ {p.preco.toFixed(2)}</p></div>
                <div><p className="text-xs text-gray-400">P. Compra</p><p className="text-sm text-gray-700">{p.precoCompra ? `R$ ${p.precoCompra.toFixed(2)}` : "—"}</p></div>
                <div>
                  <p className="text-xs text-gray-400">Margem</p>
                  {margem !== null
                    ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${margem >= 35 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{margem.toFixed(1)}%</span>
                    : <span className="text-sm text-gray-300">—</span>}
                </div>
                <div><p className="text-xs text-gray-400">Volume</p><p className="text-sm text-gray-700">{vol ?? <span className="text-gray-300 italic text-xs">—</span>}</p></div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <PeractButton action={() => setEditProduct(p)} className="flex-1 text-gray-600" size="sm" theme="secondary">Editar</PeractButton>
                <PeractButton action={() => setDeleteTarget(p)} className="border-red-200 text-red-600 hover:bg-red-50" size="sm" theme="secondary"><Trash2 size={13} /></PeractButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
