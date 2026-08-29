import { PeractButton } from "../peract-button";
import { PeractCard } from "../peract-card";
import type { PeractModalActionProps } from "./PeractModalAction.types";

export function PeractModalAction({
  btnPrimaryAction,
  buttonSecondaryAction,
  children,
  content,
  primaryLabel = "Confirmar",
  secondaryLabel = "Cancelar",
  title,
}: PeractModalActionProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <PeractCard className="w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="border-b border-gray-100 p-4">
          <h3 className="peract-serif-font text-lg text-[#26221E]">{title}</h3>
        </div>
        <div className="p-4">
          {children ?? <p className="text-sm text-gray-600">{content}</p>}
        </div>
        <div className="flex gap-2 border-t border-gray-100 p-4">
          <PeractButton action={buttonSecondaryAction} className="flex-1 text-gray-600" theme="secondary">
            {secondaryLabel}
          </PeractButton>
          <PeractButton action={btnPrimaryAction} className="flex-1">
            {primaryLabel}
          </PeractButton>
        </div>
      </PeractCard>
    </div>
  );
}