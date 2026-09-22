import { useDecantModalForm } from "../facade/useDecantModalForm";
import type { DecantModalProps } from "../models/decants.models";
import { PeractModal } from "../../../shared/components/peract-modal";
import { PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { X } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
import { ACC, perfumesBase } from "../config/decants.config";
import { PeractInputControl } from "../../../shared/components/peract-input";

export function DecantModal({
  onClose,
  onSave,
  edit
}: DecantModalProps) {
const { perfume, preco2ml, preco3ml, preco5ml, preco10ml, setPerfume, setPreco2ml, setPreco3ml, setPreco5ml, setPreco10ml, error, success, handleSave } = useDecantModalForm({ onClose, onSave, edit });
return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card">
          <PeractModalTitle className="peract-font-color-default">{edit ? "Editar Decant" : "Cadastrar Decant"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle size={16} /> Decant salvo com sucesso!
            </div>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">Perfume vinculado *</PeractLabel>
            <PeractNativeSelect value={perfume} onChange={e => setPerfume(e.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
              <option value="">Selecionar perfume em estoque...</option>
              {perfumesBase.map(p => <option key={p} value={p}>{p}</option>)}
            </PeractNativeSelect>
            <p className="text-xs peract-font-color-muted mt-1">Apenas perfumes cadastrados são exibidos.</p>
          </PeractField>

          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-3">Preços por volumetria (R$) *</PeractLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{
            label: "2ml",
            val: preco2ml,
            set: setPreco2ml
          }, {
            label: "3ml",
            val: preco3ml,
            set: setPreco3ml
          }, {
            label: "5ml",
            val: preco5ml,
            set: setPreco5ml
          }, {
            label: "10ml",
            val: preco10ml,
            set: setPreco10ml
          }].map(({
            label,
            val,
            set
          }) => <PeractField key={label}>
                  <PeractLabel className="text-xs peract-font-color-muted block mb-1">Preço {label}</PeractLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 peract-font-color-muted text-sm">R$</span>
                    <PeractInputControl type="number" min={0} step={0.01} value={val} onChange={e => set(e.target.value)} placeholder="0,00" className="w-full border peract-border-color rounded-lg pl-8 pr-3 py-2 text-sm peract-font-color-default focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""} />
                  </div>
                </PeractField>)}
            </div>
          </PeractField>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            Salvar decant
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
