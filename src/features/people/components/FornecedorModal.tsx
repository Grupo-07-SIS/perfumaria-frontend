import { useFornecedorModalForm } from "../facade/useFornecedorModalForm";
import type { FornecedorModalProps } from "../models/people.models";
import { ACC } from "../config/people.config";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { X, CheckCircle } from "lucide-react";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { EnderecoFields } from "./EnderecoFields";
export function FornecedorModal({
  data,
  onClose,
  onSave
}: FornecedorModalProps) {
  const {
    razaoSocial,
    cnpj,
    email,
    telefone,
    endereco,
    setRazaoSocial,
    setCnpj,
    setEmail,
    setTelefone,
    setEndereco,
    errors,
    success,
    clearError,
    handleSave
  } = useFornecedorModalForm({
    data,
    onClose,
    onSave
  });
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <PeractModalTitle className="peract-font-color-default">{data ? "Editar Fornecedor" : "Novo Fornecedor"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"><CheckCircle size={16} /> Salvo!</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{
          label: "Razão Social",
          key: "razaoSocial",
          val: razaoSocial,
          set: setRazaoSocial,
          ph: "Ex: Empresa Ltda",
          req: true
        }, {
          label: "CNPJ",
          key: "cnpj",
          val: cnpj,
          set: setCnpj,
          ph: "00.000.000/0001-00",
          req: true
        }, {
          label: "Telefone",
          key: "telefone",
          val: telefone,
          set: setTelefone,
          ph: "(11) 3333-4444",
          req: false
        }, {
          label: "E-mail",
          key: "email",
          val: email,
          set: setEmail,
          ph: "contato@empresa.com.br",
          req: true
        }].map(({
          label,
          key,
          val,
          set,
          ph,
          req
        }) => <PeractField key={key}>
                <PeractLabel className="text-sm text-gray-700 block mb-1.5">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</PeractLabel>
                <PeractInputControl type={key === "email" ? "email" : "text"} value={val} onChange={e => {
            set(e.target.value);
            clearError(key);
          }} placeholder={ph} className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors[key] ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors[key] ? "#f87171" : ""} />
                {errors[key] && <p className="text-xs text-red-600 mt-1">{errors[key]}</p>}
              </PeractField>)}
          </div>
          <EnderecoFields endereco={endereco} onChange={setEndereco} errors={errors} onClearError={clearError} />
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">Salvar</PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
