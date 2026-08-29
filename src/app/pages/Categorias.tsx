import { useState } from "react";
import { Plus, Pencil, Trash2, X, CheckCircle, Tag, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PeractButton } from "../../shared/components/peract-button";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractInput } from "../../shared/components/peract-input";
import { PeractModalAction } from "../../shared/components/peract-modal-action";
import { PeractPagination } from "../../shared/components/peract-pagination";
import { PeractTable } from "../../shared/components/peract-table";

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

export { CategoriesPage as Categorias } from "../../features/categories/pages/CategoriesPage";
  return (
