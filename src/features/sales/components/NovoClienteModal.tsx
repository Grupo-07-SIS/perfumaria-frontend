import { useNovoClienteModalForm } from "../facade/useNovoClienteModalForm";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { UserPlus, X, CheckCircle } from "lucide-react";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
export function NovoClienteModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (nome: string, telefone: string) => void;
}) {
  const {
    nome,
    telefone,
    setNome,
    setTelefone,
    errors,
    setErrors,
    success,
    ACC,
    handleSave
  } = useNovoClienteModalForm({
    onClose,
    onSave
  });
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm" onClose={onClose}>
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
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle size={16} /> Cliente cadastrado!
            </div>}
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">
              Nome completo <span className="text-red-500">*</span>
            </PeractLabel>
            <PeractInputControl type="text" value={nome} onChange={e => {
          setNome(e.target.value);
          setErrors(p => ({
            ...p,
            nome: ""
          }));
        }} placeholder="Ex: Ana Lima" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.nome ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.nome ? "#f87171" : ""} />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </PeractField>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">
              Telefone <span className="text-red-500">*</span>
            </PeractLabel>
            <PeractInputControl type="text" value={telefone} onChange={e => {
          setTelefone(e.target.value);
          setErrors(p => ({
            ...p,
            telefone: ""
          }));
        }} placeholder="(11) 99999-9999" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.telefone ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.telefone ? "#f87171" : ""} />
            {errors.telefone && <p className="text-xs text-red-600 mt-1">{errors.telefone}</p>}
          </PeractField>
          <p className="text-xs peract-font-color-muted">
            Endereço e demais dados podem ser preenchidos depois em{" "}
            <strong>Gestão de Pessoas</strong>.
          </p>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">
            Cancelar
          </PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            Cadastrar
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
