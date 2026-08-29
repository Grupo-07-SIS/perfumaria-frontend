import { useEffect, useState } from "react";
import {
  Search, Plus, Edit3, ChevronUp, ChevronDown, X, CheckCircle,
  AlertCircle, Trash2, PackageX, Ruler, TrendingUp,
} from "lucide-react";
import { useApp, Product, StockStatus } from "../../../app/context/AppContext";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractChip } from "../../../shared/components/peract-chip";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractModalAction } from "../../../shared/components/peract-modal-action";
import { PeractPagination } from "../../../shared/components/peract-pagination";
import { PeractSelect } from "../../../shared/components/peract-select";
import { PeractTag } from "../../../shared/components/peract-tag";
import { PeractTable } from "../../../shared/components/peract-table";

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
  const [hasVolume, setHasVolume] = useState(!!product?.volume);
  const [volumeVal, setVolumeVal] = useState(product?.volume ? String(product.volume) : "");
  const [tipoMedida, setTipoMedida] = useState(product?.tipoMedida ?? "ml");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const precoNum = parseFloat(preco) || 0;
  const precoCompraNum = parseFloat(precoCompra) || 0;
  const margem = precoNum > 0 && precoCompraNum > 0 ? ((precoNum - precoCompraNum) / precoNum) * 100 : null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Obrigatório.";
    if (!preco || parseFloat(preco) <= 0) nextErrors.preco = "Informe um preço válido.";
    if (Number.isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0) nextErrors.stock = "Qtd. inválida.";
    if (hasVolume && (!volumeVal || parseFloat(volumeVal) <= 0)) nextErrors.volume = "Informe um volume válido.";
    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSuccess(true);
    onSave({
      name: name.trim(),
      brand: brand.trim(),
      category: category || "Não vinculado",
      currentStock: parseInt(stock, 10) || 0,
      preco: parseFloat(preco),
      precoCompra: precoCompra && parseFloat(precoCompra) > 0 ? parseFloat(precoCompra) : undefined,
      tipoMedida: hasVolume ? tipoMedida : undefined,
      volume: hasVolume && volumeVal ? parseFloat(volumeVal) : undefined,
    });
    window.setTimeout(onClose, 1200);
  };

  const allCategories = [...categories, "Não vinculado"].filter((value, index, array) => array.indexOf(value) === index);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white p-4">
          <h3 className="text-[#26221E]">{product ? "Editar Produto" : "Novo Produto"}</h3>
          <PeractButton action={onClose} className="h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {success ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
              <CheckCircle size={16} /> {product ? "Produto atualizado!" : "Produto cadastrado!"}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <PeractInput autoFocus errorText={errors.name} label="Nome do produto" onValueChange={(value) => { setName(value); setErrors({ ...errors, name: "" }); }} placeholder="Ex: Chanel N°5" required type="text" validation={errors.name ? "invalid" : "non-validation"} value={name} />
            </div>

            <div>
              <PeractInput label="Marca" onValueChange={setBrand} placeholder="Ex: Chanel" type="text" value={brand} />
            </div>

            <div>
              <PeractSelect data={allCategories.map((item) => ({ name: item, value: item }))} label="Categoria" onValueChange={setCategory} value={category} />
            </div>

            <div>
              <PeractInput errorText={errors.stock} label="Estoque atual" min={0} onValueChange={(value) => { setStock(value); setErrors({ ...errors, stock: "" }); }} required type="number" validation={errors.stock ? "invalid" : "non-validation"} value={stock} />
            </div>

            <div>
              <PeractInput errorText={errors.preco} label="Preço de venda (R$)" min={0} onValueChange={(value) => { setPreco(value); setErrors({ ...errors, preco: "" }); }} placeholder="0,00" required step={0.01} type="number" validation={errors.preco ? "invalid" : "non-validation"} value={preco} />
            </div>

            <div>
              <PeractInput label="Preço de compra (R$)" min={0} onValueChange={setPrecoCompra} placeholder="0,00" step={0.01} type="number" value={precoCompra} />
            </div>

            {margem !== null ? (
              <div className="sm:col-span-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: margem >= 30 ? "#f0fdf4" : "#fef3c7", color: margem >= 30 ? "#166534" : "#92400e" }}>
                <TrendingUp size={12} />
                Margem de lucro estimada: <strong>{margem.toFixed(1)}%</strong>
                {margem < 20 ? " · Margem baixa" : null}
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50">
              <div className="relative">
                <input
                  checked={hasVolume}
                  className="sr-only"
                  onChange={(event) => {
                    setHasVolume(event.target.checked);
                    if (!event.target.checked) {
                      setVolumeVal("");
                      setErrors({ ...errors, volume: "" });
                    }
                  }}
                  type="checkbox"
                />
                <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${hasVolume ? "border-[#A67449]" : "border-gray-300"}`} style={{ background: hasVolume ? "#A67449" : "white" }}>
                  {hasVolume ? <CheckCircle size={12} className="text-white" /> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">Deseja inserir volume</span>
              </div>
            </label>
            {hasVolume ? (
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#FAFAFA] px-4 pb-4 pt-2">
                <p className="text-xs text-gray-400">Informe a capacidade do produto e a unidade de medida</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <PeractInput errorText={errors.volume} label="Capacidade" min={0} onValueChange={(value) => { setVolumeVal(value); setErrors({ ...errors, volume: "" }); }} placeholder="Ex: 200" required step={0.1} type="number" validation={errors.volume ? "invalid" : "non-validation"} value={volumeVal} />
                  </div>
                  <div>
                    <PeractSelect data={UNIDADES.map((unit) => ({ name: unit, value: unit }))} label="Tipo de medida" onValueChange={setTipoMedida} required value={tipoMedida} />
                  </div>
                </div>
                {volumeVal && tipoMedida ? (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-[#A67449]">
                    <Ruler size={11} /> Volume exibido: <strong>{volumeVal}{tipoMedida}</strong>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-2 border-t border-gray-100 bg-white p-4">
          <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary">Cancelar</PeractButton>
          <PeractButton action={handleSave} className="flex-1">{product ? "Salvar alterações" : "Cadastrar produto"}</PeractButton>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <PeractModalAction btnPrimaryAction={onConfirm} buttonSecondaryAction={onClose} primaryLabel="Remover" title="Remover produto">
      <p className="text-sm text-gray-600">
        Tem certeza que deseja remover <strong className="text-gray-800">"{name}"</strong>? Esta ação não pode ser desfeita.
      </p>
    </PeractModalAction>
  );
}

export function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, categories, stockThresholds } = useApp();
  const itemsPerPage = 6;
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const categoryNames = ["Todos", ...categories.map((category) => category.nome)];

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
      return;
    }

    setSortField(field);
    setSortAsc(true);
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
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const filtered = products
    .filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) || product.brand.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || product.status === statusFilter;
      const matchCategory = activeCategory === "Todos" || product.category === activeCategory;
      return matchSearch && matchStatus && matchCategory;
    })
    .sort((productA, productB) => {
      const valueA = productA[sortField];
      const valueB = productB[sortField];

      if (typeof valueA === "string" && typeof valueB === "string") return sortAsc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      if (typeof valueA === "number" && typeof valueB === "number") return sortAsc ? valueA - valueB : valueB - valueA;
      return 0;
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ field }: { field: keyof Product }) =>
    sortField === field ? (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ChevronDown size={13} className="opacity-30" />;

  const volumeLabel = (product: Product) => product.volume && product.tipoMedida ? `${product.volume}${product.tipoMedida}` : null;
  const marginLabel = (product: Product) => {
    if (!product.precoCompra || product.precoCompra <= 0) return null;
    return ((product.preco - product.precoCompra) / product.preco) * 100;
  };

  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6" id="products-section">
      {(editProduct || showNew) ? (
        <ProductModal
          categories={categories.map((category) => category.nome)}
          onClose={() => {
            setEditProduct(null);
            setShowNew(false);
          }}
          onSave={editProduct ? handleSaveEdit : handleSaveNew}
          product={editProduct ?? undefined}
        />
      ) : null}
      {deleteTarget ? <DeleteConfirm name={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} /> : null}

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[#26221E]">Estoque – Produtos</h1>
          <nav className="mt-0.5 text-xs text-gray-400">Estoque &rsaquo; <span className="text-[#A67449]">Produtos</span></nav>
        </div>
        <PeractButton action={() => setShowNew(true)} className="self-start" icon={<Plus size={16} />}>Novo produto</PeractButton>
      </div>

      <div className="mb-4 flex w-fit items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs text-gray-400 shadow-sm">
        <AlertCircle size={13} className="text-amber-500" />
        Status Crítico: estoque ≤ <strong className="mx-1 text-gray-600">{stockThresholds.critico}</strong> · Esgotado quando = 0
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {categoryNames.map((category) => (
          <PeractChip key={category} actionFilter={(value) => setActiveCategory(String(value))} data={{ label: category, selected: activeCategory === category, value: category }} />
        ))}
      </div>

      <PeractCard className="mb-4 flex flex-col gap-3 p-3 shadow-sm sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
          <Search size={15} className="shrink-0 text-gray-400" />
          <PeractInput className="border-0 bg-transparent px-0 py-0 shadow-none" onValueChange={setSearch} placeholder="Buscar por nome ou marca..." type="text" value={search} />
        </div>
        <div className="sm:w-44">
          <PeractSelect
            data={[
              { name: "Todos os status", value: "todos" },
              { name: "OK", value: "ok" },
              { name: "Crítico", value: "critico" },
              { name: "Esgotado", value: "esgotado" },
            ]}
            onValueChange={setStatusFilter}
            value={statusFilter}
          />
        </div>
      </PeractCard>

      <div className="hidden md:block">
        <PeractTable
          data={paginatedProducts}
          emptyState="Nenhum produto encontrado."
          footer={
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-gray-400">Exibindo {paginatedProducts.length} de {filtered.length} produtos filtrados</p>
              <PeractPagination currentPage={currentPage} onPageChange={setCurrentPage} targetSelection="products-section" totalPages={totalPages} />
            </div>
          }
          header={[
            { name: "Produto", value: "name", orderColumn: true },
            { name: "Marca", value: "brand", orderColumn: true },
            { name: "Categoria", value: "category", orderColumn: true },
            { name: "Volume", value: "volume", orderColumn: true },
            { name: "Estoque", value: "currentStock", orderColumn: true },
            { name: "P. Venda", value: "preco", orderColumn: true },
            { name: "P. Compra", value: "precoCompra", orderColumn: true },
            { name: "Margem", value: "precoCompra", orderColumn: true },
            { name: "Status", value: "status", orderColumn: true },
            { name: "Ações", value: "actions" },
          ]}
          onOrderColumn={(field) => handleSort(field as keyof Product)}
          renderHeaderLabel={(column) => column.orderColumn ? <div className="flex items-center gap-1">{column.name}<SortIcon field={column.value as keyof Product} /></div> : column.name}
          renderRow={(product) => {
            const status = statusConfig[product.status];
            const volume = volumeLabel(product);
            const margin = marginLabel(product);

            return (
              <tr key={product.id} className="transition-colors hover:bg-gray-50/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">{product.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                <td className="px-4 py-3"><PeractTag>{product.category}</PeractTag></td>
                <td className="px-4 py-3">{volume ? <PeractTag className="w-fit bg-blue-50 text-blue-600" icon={<Ruler size={10} />}>{volume}</PeractTag> : <span className="text-xs italic text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.currentStock}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">R$ {product.preco.toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{product.precoCompra ? `R$ ${product.precoCompra.toFixed(2)}` : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">{margin !== null ? <PeractTag type={margin >= 35 ? "success" : margin >= 20 ? "warning" : "alert"}>{margin.toFixed(1)}%</PeractTag> : <span className="text-xs text-gray-300">—</span>}</td>
                <td className="px-4 py-3"><PeractTag className="border-0" icon={status.icon} style={{ color: status.color, background: status.bg }}>{status.label}</PeractTag></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PeractButton action={() => setEditProduct(product)} className="h-8 w-8 text-gray-400 hover:bg-amber-50 hover:text-amber-700" size="icon" theme="secondary" title="Editar"><Edit3 size={15} /></PeractButton>
                    <PeractButton action={() => setDeleteTarget(product)} className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600" size="icon" theme="secondary" title="Remover"><Trash2 size={15} /></PeractButton>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {paginatedProducts.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white py-12 text-center text-sm text-gray-400">Nenhum produto encontrado.</div>
        ) : paginatedProducts.map((product) => {
          const status = statusConfig[product.status];
          const volume = volumeLabel(product);
          const margin = marginLabel(product);

          return (
            <PeractCard key={product.id} className="p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.brand} · {product.category}</p>
                </div>
                <PeractTag className="shrink-0 border-0" icon={status.icon} style={{ color: status.color, background: status.bg }}>{status.label}</PeractTag>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div><p className="text-xs text-gray-400">Estoque</p><p className="text-sm font-medium text-gray-800">{product.currentStock}</p></div>
                <div><p className="text-xs text-gray-400">P. Venda</p><p className="text-sm text-gray-700">R$ {product.preco.toFixed(2)}</p></div>
                <div><p className="text-xs text-gray-400">P. Compra</p><p className="text-sm text-gray-700">{product.precoCompra ? `R$ ${product.precoCompra.toFixed(2)}` : "—"}</p></div>
                <div><p className="text-xs text-gray-400">Margem</p>{margin !== null ? <PeractTag type={margin >= 35 ? "success" : "warning"}>{margin.toFixed(1)}%</PeractTag> : <span className="text-sm text-gray-300">—</span>}</div>
                <div><p className="text-xs text-gray-400">Volume</p><p className="text-sm text-gray-700">{volume ?? <span className="text-xs italic text-gray-300">—</span>}</p></div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
                <PeractButton action={() => setEditProduct(product)} className="flex-1 text-gray-600" size="sm" theme="secondary">Editar</PeractButton>
                <PeractButton action={() => setDeleteTarget(product)} className="border-red-200 text-red-600 hover:bg-red-50" size="sm" theme="secondary"><Trash2 size={13} /></PeractButton>
              </div>
            </PeractCard>
          );
        })}
      </div>

      <div className="mt-4 md:hidden">
        <PeractPagination currentPage={currentPage} onPageChange={setCurrentPage} targetSelection="products-section" totalPages={totalPages} />
      </div>
    </div>
  );
}