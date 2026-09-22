import { PeractModal } from "../../../shared/components/peract-modal";
import { PeractModalTitle } from "../../../shared/components/peract-modal";
import { UserMinus } from "lucide-react";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";

export function InativarConfirm({
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
          <PeractModalTitle className="peract-font-color-default">Inativar Cliente</PeractModalTitle>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{
        background: "#FFF7ED",
        border: "1px solid #FED7AA"
      }}>
            <UserMinus size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Inativar "{nome}"?</p>
              <p className="text-xs text-amber-600 mt-0.5">O cliente será marcado como inativo e não aparecerá nas buscas padrão. Você pode reativar a qualquer momento.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm text-white bg-amber-600 hover:bg-amber-700" variant="plain" size="plain">Inativar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
