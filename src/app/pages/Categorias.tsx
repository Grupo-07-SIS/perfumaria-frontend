import { useState } from "react";
import { Plus, Pencil, Trash2, X, CheckCircle, Tag, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PeractButton } from "../../shared/components/peract-button";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractInput } from "../../shared/components/peract-input";
import { PeractModalAction } from "../../shared/components/peract-modal-action";

/* ─── Modal ─── */
interface CategoriaModalProps {
  onClose: () => void;
  onSave: (nome: string) => void;
  editNome?: string;
}

function CategoriaModal({ onClose, onSave, editNome }: CategoriaModalProps) {
  const [nome, setNome] = useState(editNome ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!nome.trim()) { setError("O nome da categoria é obrigatório."); return; }
    setError("");
    setSuccess(true);
    onSave(nome.trim());
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-[#26221E]">{editNome ? "Editar Categoria" : "Nova Categoria"}</h3>
          <PeractButton action={onClose} className="h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {success && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" role="status">
              <CheckCircle size={16} /> Categoria salva com sucesso!
            </div>
          )}
          <PeractInput
            autoFocus
            errorText={error}
            label="Nome da categoria"
            onValueChange={(value) => { setNome(value); setError(""); }}
            placeholder="Ex: Perfumes, Body Splash, Kits..."
            required
            type="text"
            validation={error ? "invalid" : "non-validation"}
            value={nome}
          />
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary">Cancelar</PeractButton>
          <PeractButton action={handleSave} className="flex-1">Salvar</PeractButton>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm ─── */
interface DeleteConfirmProps {
  nome: string;
  produtosVinculados: number;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirm({ nome, produtosVinculados, onClose, onConfirm }: DeleteConfirmProps) {
  return (
    <PeractModalAction
      btnPrimaryAction={onConfirm}
      buttonSecondaryAction={onClose}
      primaryLabel="Excluir"
      title="Excluir categoria"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir a categoria{" "}
          <strong className="text-gray-800">"{nome}"</strong>?
        </p>
        {produtosVinculados > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              <strong>{produtosVinculados} produto(s)</strong> vinculados a esta categoria serão
              movidos para <strong>"Não vinculado"</strong> automaticamente.
            </p>
          </div>
        )}
      </div>
    </PeractModalAction>
  );
}

/* ─── Main ─── */
export function Categorias() {
  const { categories, products, addCategory, editCategory, deleteCategory } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<{ id: number; nome: string } | null>(null);
  const [deleteCat, setDeleteCat] = useState<{ id: number; nome: string } | null>(null);

  const handleSave = (nome: string) => {
    if (editCat) {
      editCategory(editCat.id, nome);
    } else {
      addCategory(nome);
    }
    setEditCat(null);
    setShowModal(false);
  };

  const handleDelete = () => {
    if (deleteCat) {
      deleteCategory(deleteCat.id);
      setDeleteCat(null);
    }
  };

  // Count products per category
  const countForCategory = (nome: string) => products.filter((p) => p.category === nome).length;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {(showModal || editCat) && (
        <CategoriaModal
          onClose={() => { setShowModal(false); setEditCat(null); }}
          onSave={handleSave}
          editNome={editCat?.nome}
        />
      )}
      {deleteCat && (
        <DeleteConfirm
          nome={deleteCat.nome}
          produtosVinculados={countForCategory(deleteCat.nome)}
          onClose={() => setDeleteCat(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[#26221E]">Categorias</h1>
          <nav className="text-xs text-gray-400 mt-0.5">
            Estoque &rsaquo; <span className="text-[#A67449]">Categorias</span>
          </nav>
        </div>
        <PeractButton action={() => setShowModal(true)} className="self-start" icon={<Plus size={16} />}>Nova Categoria</PeractButton>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {categories.map((cat) => (
          <PeractCard key={cat.id} className="flex items-center gap-3 p-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#FFF3E8" }}>
              <Tag size={16} style={{ color: "#A67449" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{cat.nome}</p>
              <p className="text-xs text-gray-400">{countForCategory(cat.nome)} produto(s)</p>
            </div>
          </PeractCard>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F2F2F2" }}>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nome da Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Produtos vinculados</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-gray-400 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Tag size={32} className="text-gray-300" />
                    <p>Nenhuma categoria cadastrada.</p>
                    <button onClick={() => setShowModal(true)} className="mt-1 text-xs px-3 py-1.5 rounded-lg text-white hover:opacity-90" style={{ background: "#A67449" }}>
                      Criar primeira categoria
                    </button>
                  </div>
                </td>
              </tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-gray-400">#{cat.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#FFF3E8" }}>
                      <Tag size={12} style={{ color: "#A67449" }} />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{cat.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{countForCategory(cat.nome)} produto(s)</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PeractButton
                      action={() => setEditCat({ id: cat.id, nome: cat.nome })}
                      className="h-8 w-8 text-gray-400 hover:bg-amber-50 hover:text-amber-700"
                      size="icon"
                      theme="secondary"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </PeractButton>
                    <PeractButton
                      action={() => setDeleteCat({ id: cat.id, nome: cat.nome })}
                      className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      size="icon"
                      theme="secondary"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </PeractButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">{categories.length} categorias cadastradas</p>
        </div>
      </div>
    </div>
  );
}
