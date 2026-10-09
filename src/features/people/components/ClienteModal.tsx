import { useClienteModalForm } from "../facade/useClienteModalForm";
import type { ClienteModalProps } from "../models/people.models";
import { ACC } from "../config/people.config";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { X, CheckCircle } from "lucide-react";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { EnderecoFields } from "./EnderecoFields";
export function ClienteModal({
  data,
  onClose,
  onSave
}: ClienteModalProps) {
  const {
    nome,
    telefone,
    email,
    endereco,
    setNome,
    setTelefone,
    setEmail,
    setEndereco,
    errors,
    success,
    clearError,
    handleSave
  } = useClienteModalForm({
    data,
    onClose,
    onSave
  });
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <PeractModalTitle className="peract-font-color-default">{data ? "Editar Cliente" : "Novo Cliente"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"><CheckCircle size={16} /> Salvo!</div>}
          {errors.form && <p role="alert" className="text-sm text-red-600">{errors.form}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PeractField>
              <PeractLabel className="text-sm text-gray-700 block mb-1.5">Nome completo <span className="text-red-500">*</span></PeractLabel>
              <PeractInputControl type="text" autoComplete="name" value={nome} onChange={e => {
            setNome(e.target.value);
            clearError("nome");
          }} placeholder="Ex: Ana Lima" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.nome ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.nome ? "#f87171" : ""} />
              {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
            </PeractField>
            <PeractField>
              <PeractLabel className="text-sm text-gray-700 block mb-1.5">Telefone <span className="text-red-500">*</span></PeractLabel>
              <PeractInputControl type="tel" inputMode="tel" autoComplete="tel" maxLength={15} aria-invalid={!!errors.telefone} value={telefone} onChange={e => {
            setTelefone(e.target.value);
            clearError("telefone");
          }} placeholder="(11) 99999-9999" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.telefone ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.telefone ? "#f87171" : ""} />
              {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
            </PeractField>
          </div>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">E-mail <span className="text-xs peract-font-color-muted">(opcional)</span></PeractLabel>
            <PeractInputControl type="email" inputMode="email" autoComplete="email" maxLength={254} aria-invalid={!!errors.email} value={email} onChange={e => {
          setEmail(e.target.value);
          clearError("email");
        }} placeholder="cliente@email.com" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.email ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.email ? "#f87171" : ""} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </PeractField>
          <EnderecoFields endereco={endereco} onChange={setEndereco} errors={errors} onClearError={clearError} />
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">Salvar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
