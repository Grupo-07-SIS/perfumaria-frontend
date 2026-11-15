import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { Pencil, Trash2 } from "lucide-react";
export function CardActions({
  onEdit,
  onDelete
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return <div className="flex items-center gap-1">
      <PeractButtonPrimitive onClick={onEdit} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-gray-100" title="Editar" variant="plain" size="plain" aria-label="Editar"><Pencil size={14} /></PeractButtonPrimitive>
      <PeractButtonPrimitive onClick={onDelete} className="p-1.5 rounded-lg peract-font-color-muted transition-colors hover:bg-red-50 hover:text-red-600" title="Excluir" variant="plain" size="plain" aria-label="Excluir"><Trash2 size={14} /></PeractButtonPrimitive>
    </div>;
}
