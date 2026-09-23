import { useBodySplashModalForm } from "../facade/useBodySplashModalForm";
import type { ModalProps } from "../models/body-splash.models";
import { VOLUMES, ACC } from "../config/body-splash.config";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { X, CheckCircle } from "lucide-react";

/* ─── Brand accent ─── */
/* ─── Brand accent ─── */

/* ─── Brand accent ─── */
/* ─── Brand accent ─── */
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
import { PeractInputControl } from "../../../shared/components/peract-input";
export function BodySplashModal({
  onClose,
  onSave,
  productOptions,
  edit
}: ModalProps) {
  const {
    produtoId,
    precos,
    setProdutoId,
    setPrecos,
    error,
    success,
    handleSave
  } = useBodySplashModalForm({
    onClose,
    onSave,
    edit
  });
  return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card">
          <PeractModalTitle className="peract-font-color-default">{edit ? "Editar Body Splash" : "Cadastrar Body Splash"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle size={16} /> Body Splash salvo com sucesso!
            </div>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Produto */}
          <PeractField>
            <PeractLabel htmlFor="body-splash-product" className="text-sm text-gray-700 block mb-1.5">Body Splash vinculado *</PeractLabel>
            <PeractNativeSelect id="body-splash-product" value={produtoId} onChange={e => setProdutoId(e.target.value)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none" style={{
          outline: "none"
        }} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
              <option value="">Selecionar Body Splash...</option>
              {!edit?.produtoId && edit?.produto && <option value="" disabled>{edit.produto}</option>}
              {productOptions.map(option => <option key={option.id} value={option.id}>{option.nome}</option>)}
            </PeractNativeSelect>
            <p className="text-xs peract-font-color-muted mt-1">Selecione o produto base vinculado aos frascos.</p>
          </PeractField>

          {/* Preços */}
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-3">Preços por volumetria (R$) *</PeractLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VOLUMES.map(({
            key,
            label
          }) => <PeractField key={key}>
                  <PeractLabel htmlFor={`body-splash-price-${label}`} className="text-xs peract-font-color-muted block mb-1">Frasco {label}</PeractLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 peract-font-color-muted text-sm">R$</span>
                    <PeractInputControl id={`body-splash-price-${label}`} type="number" min={0} step={0.01} value={precos[key]} onChange={e => setPrecos(p => ({
                ...p,
                [key]: e.target.value
              }))} placeholder="0,00" className="w-full border peract-border-color rounded-lg pl-8 pr-3 py-2 text-sm peract-font-color-default focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""} />
                  </div>
                </PeractField>)}
            </div>
          </PeractField>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">
            {edit ? "Salvar alterações" : "Cadastrar Body Splash"}
          </PeractButtonPrimitive>
        </div>
      </PeractModal>;
}
