import { useState } from "react";
import { Plus, Pencil, Trash2, X, CheckCircle, Tag, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";

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
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {success && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" role="status">
              <CheckCircle size={16} /> Categoria salva com sucesso!
            </div>
          )}
          <div>
            <label className="text-sm text-gray-700 block mb-1.5">Nome da categoria *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => { setNome(e.target.value); setError(""); }}
              placeholder="Ex: Perfumes, Body Splash, Kits..."
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#A67449]"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90" style={{ background: "#A67449" }}>
            Salvar
          </button>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-[#26221E]">Excluir categoria</h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir a categoria{" "}
            <strong className="text-gray-800">"{nome}"</strong>?
          </p>
          {produtosVinculados > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <strong>{produtosVinculados} produto(s)</strong> vinculados a esta categoria serão
                movidos para <strong>"Não vinculado"</strong> automaticamente.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700">
            Excluir
          </button>
        </div>
      </div>
    </div>
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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm self-start hover:opacity-90"
          style={{ background: "#A67449" }}
        >
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#FFF3E8" }}>
              <Tag size={16} style={{ color: "#A67449" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{cat.nome}</p>
              <p className="text-xs text-gray-400">{countForCategory(cat.nome)} produto(s)</p>
            </div>
          </div>
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
                    <button
                      onClick={() => setEditCat({ id: cat.id, nome: cat.nome })}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-700 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteCat({ id: cat.id, nome: cat.nome })}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
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
