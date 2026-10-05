import { PeractModalAction } from "../../../shared/components/peract-modal-action";
interface DeleteProductModalProps {
  categoriaNome: string;
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}
export function DeleteProductModal({
  categoriaNome,
  nome,
  onClose,
  onConfirm,
  submitting
}: DeleteProductModalProps) {
  const category = categoriaNome.trim().toLocaleLowerCase("pt-BR");
  const linkedPricingWarning = category.includes("perfume")
    ? "Se este perfume possuir vínculo com decantes, a remoção também excluirá a tabela de preços desses decantes."
    : category.includes("body splash")
      ? "Se este body splash possuir vínculo com frascos fracionados, a remoção também excluirá a tabela de preços desses frascos."
      : null;

  return <PeractModalAction submitting={submitting} btnPrimaryAction={onConfirm} buttonSecondaryAction={onClose} primaryLabel={submitting ? "Excluindo..." : "Remover"} title="Remover produto">
      <p className="text-sm text-gray-600">
        Tem certeza que deseja remover <strong className="peract-font-color-default">"{nome}"</strong>? Esta ação não pode ser desfeita.
      </p>
      {linkedPricingWarning ? <p className="mt-2 text-sm text-amber-700">{linkedPricingWarning}</p> : null}
    </PeractModalAction>;
}
