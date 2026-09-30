import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { UserCheck } from "lucide-react";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
export function ReativarConfirm({
  nome,
  onClose,
  onConfirm
}: {
  nome: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={onClose}>
        <div className="p-4 border-b peract-border-color">
          <PeractModalTitle className="peract-font-color-default">Reativar Cliente</PeractModalTitle>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50">
            <UserCheck size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Reativar "{nome}"?</p>
              <p className="text-xs text-green-700 mt-0.5">O cliente voltará para a lista de ativos.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-green-600 hover:bg-green-700" variant="plain" size="plain">Reativar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
