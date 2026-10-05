import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
export function DeleteConfirm({
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
