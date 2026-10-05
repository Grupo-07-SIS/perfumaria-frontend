import { PeractButton } from "../peract-button";
import { PeractModal, PeractModalTitle } from "../peract-modal";
import type { PeractModalActionProps } from "./PeractModalAction.types";
export function PeractModalAction({
  btnPrimaryAction,
  buttonSecondaryAction,
  children,
  content,
  heading,
  actions,
  submitting = false,
  primaryLabel = "Confirmar",
  secondaryLabel = "Cancelar",
  title
}: PeractModalActionProps) {
  return <PeractModal className="max-w-sm shadow-2xl" onClose={() => { if (!submitting) buttonSecondaryAction(); }}>
        <div className="border-b peract-border-color p-4">
          {heading ?? <PeractModalTitle className="peract-serif-font text-lg peract-font-color-default">{title}</PeractModalTitle>}
        </div>
        <div className="p-4">
          {children ?? <p className="text-sm text-gray-600">{content}</p>}
        </div>
        <div className="flex gap-2 border-t peract-border-color p-4">
          {actions ?? <><PeractButton disabled={submitting} action={buttonSecondaryAction} className="flex-1 text-gray-600" theme="secondary">
            {secondaryLabel}
          </PeractButton>
          <PeractButton disabled={submitting} action={btnPrimaryAction} className="flex-1">
            {primaryLabel}
          </PeractButton></>}
        </div>
    </PeractModal>;
}
