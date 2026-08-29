import { useState } from "react";
import { Plus, Pencil, Trash2, X, CheckCircle, Tag, AlertTriangle } from "lucide-react";
import { useApp } from "../../../app/context/AppContext";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractModalAction } from "../../../shared/components/peract-modal-action";
import { PeractPagination } from "../../../shared/components/peract-pagination";
import { PeractTable } from "../../../shared/components/peract-table";

interface CategoryModalProps {
  editNome?: string;
  onClose: () => void;
  onSave: (nome: string) => void;
}

function CategoryModal({ editNome, onClose, onSave }: CategoryModalProps) {
  const [nome, setNome] = useState(editNome ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!nome.trim()) {
      setError("O nome da categoria é obrigatório.");
      return;
    }

    setError("");
    setSuccess(true);
    onSave(nome.trim());
    window.setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-[#26221E]">{editNome ? "Editar Categoria" : "Nova Categoria"}</h3>
          <PeractButton action={onClose} className="h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>
        <div className="flex flex-col gap-3 p-4">
          {success ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
              <CheckCircle size={16} /> Categoria salva com sucesso!
            </div>
          ) : null}
          <PeractInput autoFocus errorText={error} label="Nome da categoria" onValueChange={(value) => { setNome(value); setError(""); }} placeholder="Ex: Perfumes, Body Splash, Kits..." required type="text" validation={error ? "invalid" : "non-validation"} value={nome} />
        </div>
        <div className="flex gap-2 border-t border-gray-100 p-4">
          <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary">Cancelar</PeractButton>
          <PeractButton action={handleSave} className="flex-1">Salvar</PeractButton>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmProps {
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
  produtosVinculados: number;
}

function DeleteConfirm({ nome, onClose, onConfirm, produtosVinculados }: DeleteConfirmProps) {
  return (
    <PeractModalAction btnPrimaryAction={onConfirm} buttonSecondaryAction={onClose} primaryLabel="Excluir" title="Excluir categoria">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">Tem certeza que deseja excluir a categoria <strong className="text-gray-800">"{nome}"</strong>?</p>
        {produtosVinculados > 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700"><strong>{produtosVinculados} produto(s)</strong> vinculados a esta categoria serão movidos para <strong>"Não vinculado"</strong> automaticamente.</p>
          </div>
        ) : null}
      </div>
    </PeractModalAction>
  );
}

export function CategoriesPage() {
  const { categories, products, addCategory, editCategory, deleteCategory } = useApp();
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<{ id: number; nome: string } | null>(null);
  const [deleteCat, setDeleteCat] = useState<{ id: number; nome: string } | null>(null);

  const handleSave = (nome: string) => {
    if (editCat) editCategory(editCat.id, nome);
    else addCategory(nome);
    setEditCat(null);
    setShowModal(false);
  };

  const handleDelete = () => {
    if (deleteCat) {
      deleteCategory(deleteCat.id);
      setDeleteCat(null);
    }
  };

  const countForCategory = (nome: string) => products.filter((product) => product.category === nome).length;
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
  const paginatedCategories = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6" id="categories-section">
      {(showModal || editCat) ? <CategoryModal editNome={editCat?.nome} onClose={() => { setShowModal(false); setEditCat(null); }} onSave={handleSave} /> : null}
      {deleteCat ? <DeleteConfirm nome={deleteCat.nome} onClose={() => setDeleteCat(null)} onConfirm={handleDelete} produtosVinculados={countForCategory(deleteCat.nome)} /> : null}

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[#26221E]">Categorias</h1>
          <nav className="mt-0.5 text-xs text-gray-400">Estoque &rsaquo; <span className="text-[#A67449]">Categorias</span></nav>
        </div>
        <PeractButton action={() => setShowModal(true)} className="self-start" icon={<Plus size={16} />}>Nova Categoria</PeractButton>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((category) => (
          <PeractCard key={category.id} className="flex items-center gap-3 p-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#FFF3E8" }}>
              <Tag size={16} style={{ color: "#A67449" }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{category.nome}</p>
              <p className="text-xs text-gray-400">{countForCategory(category.nome)} produto(s)</p>
            </div>
          </PeractCard>
        ))}
      </div>

      <PeractTable
        data={paginatedCategories}
        emptyState={<div className="flex flex-col items-center gap-2"><Tag size={32} className="text-gray-300" /><p>Nenhuma categoria cadastrada.</p><PeractButton action={() => setShowModal(true)} size="sm">Criar primeira categoria</PeractButton></div>}
        footer={<div className="flex items-center justify-between gap-4"><p className="text-xs text-gray-400">{categories.length} categorias cadastradas</p><PeractPagination currentPage={currentPage} onPageChange={setCurrentPage} targetSelection="categories-section" totalPages={totalPages} /></div>}
        header={[
          { name: "ID", value: "id" },
          { name: "Nome da Categoria", value: "nome" },
          { name: "Produtos vinculados", value: "linkedProducts" },
          { name: "Ações", value: "actions" },
        ]}
        renderRow={(category) => (
          <tr key={category.id} className="transition-colors hover:bg-gray-50/50">
            <td className="px-4 py-3 font-mono text-sm text-gray-400">#{category.id}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "#FFF3E8" }}>
                  <Tag size={12} style={{ color: "#A67449" }} />
                </div>
                <span className="text-sm font-medium text-gray-800">{category.nome}</span>
              </div>
            </td>
            <td className="px-4 py-3"><span className="text-sm text-gray-600">{countForCategory(category.nome)} produto(s)</span></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <PeractButton action={() => setEditCat({ id: category.id, nome: category.nome })} className="h-8 w-8 text-gray-400 hover:bg-amber-50 hover:text-amber-700" size="icon" theme="secondary" title="Editar"><Pencil size={15} /></PeractButton>
                <PeractButton action={() => setDeleteCat({ id: category.id, nome: category.nome })} className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600" size="icon" theme="secondary" title="Excluir"><Trash2 size={15} /></PeractButton>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}