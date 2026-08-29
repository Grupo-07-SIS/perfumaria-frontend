import { PeractModalAction } from "../../../shared/components/peract-modal-action";

interface DeleteProductModalProps {
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function DeleteProductModal({ nome, onClose, onConfirm, submitting }: DeleteProductModalProps) {
  return (
    <PeractModalAction
      btnPrimaryAction={onConfirm}
      buttonSecondaryAction={onClose}
      primaryLabel={submitting ? "Excluindo..." : "Remover"}
      title="Remover produto"
    >
      <p className="text-sm text-gray-600">
        Tem certeza que deseja remover <strong className="text-gray-800">"{nome}"</strong>? Esta ação não pode ser desfeita.
      </p>
    </PeractModalAction>
  );
}