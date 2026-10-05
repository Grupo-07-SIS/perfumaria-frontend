import { AlertTriangle } from "lucide-react";
import { PeractModalAction } from "../../../shared/components/peract-modal-action";
interface DeleteCategoryModalProps {
  linkedProducts: number;
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
}
export function DeleteCategoryModal({
  linkedProducts,
  nome,
  onClose,
  onConfirm
}: DeleteCategoryModalProps) {
  return <PeractModalAction btnPrimaryAction={onConfirm} buttonSecondaryAction={onClose} primaryLabel="Excluir" title="Excluir categoria">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">Tem certeza que deseja excluir a categoria <strong className="peract-font-color-default">"{nome}"</strong>?</p>
        {linkedProducts > 0 ? <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700"><strong>{linkedProducts} produto(s)</strong> vinculados a esta categoria serão movidos para <strong>"Não vinculado"</strong> automaticamente.</p>
          </div> : null}
      </div>
    </PeractModalAction>;
}
