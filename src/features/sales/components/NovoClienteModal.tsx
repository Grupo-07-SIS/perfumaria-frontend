import { useNovoClienteModalForm } from "../facade/useNovoClienteModalForm";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { UserPlus, X } from "lucide-react";
import type { NovoClienteModalFormValues } from "../models/sales.models";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
export function NovoClienteModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (values: NovoClienteModalFormValues) => Promise<void>;
}) {
  const {
    nome,
    telefone,
    setNome,
    setTelefone,
    errors,
    setErrors,
    email,
    setEmail,
    saving,
    submitError,
    ACC,
    handleSave
  } = useNovoClienteModalForm({
    onClose,
    onSave
  });
    return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={() => { if (!saving) onClose(); }}>
      <fieldset disabled={saving} className="min-w-0" aria-busy={saving}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 peract-bg-accent">
              <UserPlus size={15} />
            </div>
            <PeractModalTitle className="text-sm font-medium peract-font-color-default">
              Cadastrar novo cliente
            </PeractModalTitle>
          </div>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar">
            <X size={18} />
          </PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}
          <PeractField>
            <PeractLabel htmlFor="sale-customer-name" className="text-sm text-gray-700 block mb-1.5">
              Nome completo <span className="text-red-500">*</span>
            </PeractLabel>
            <PeractInputControl id="sale-customer-name" maxLength={45} type="text" value={nome} onChange={e => {
          setNome(e.target.value);
          setErrors(p => ({
            ...p,
            nome: ""
          }));
        }} placeholder="Ex: Ana Lima" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.nome ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.nome ? "#f87171" : ""} />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </PeractField>
          <PeractField>
            <PeractLabel htmlFor="sale-customer-phone" className="text-sm text-gray-700 block mb-1.5">
              Telefone <span className="text-red-500">*</span>
            </PeractLabel>
            <PeractInputControl id="sale-customer-phone" type="tel" maxLength={20} value={telefone} onChange={e => {
          setTelefone(e.target.value);
          setErrors(p => ({
            ...p,
            telefone: ""
          }));
        }} placeholder="(11) 99999-9999" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.telefone ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.telefone ? "#f87171" : ""} />
            {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
          </PeractField>
          <PeractField>
            <PeractLabel htmlFor="sale-customer-email" className="text-sm text-gray-700 block mb-1.5">E-mail *</PeractLabel>
            <PeractInputControl id="sale-customer-email" type="email" maxLength={100} value={email} onChange={event => setEmail(event.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </PeractField>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">
            Cancelar
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            {saving ? "Cadastrando..." : "Cadastrar"}
          </PeractButtonPrimitive>
        </div>
        </fieldset>
      </PeractModal>;
}
