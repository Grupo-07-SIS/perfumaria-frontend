import { useFuncionarioModalForm } from "../facade/useFuncionarioModalForm";
import type { FuncionarioModalProps } from "../models/people.models";
import type { CargoFuncionario } from "../../../core/store/AppContext";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { X, CheckCircle, KeyRound, EyeOff, Eye } from "lucide-react";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { ACC } from "../config/people.config";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
export function FuncionarioModal({
  data,
  onClose,
  onSave
}: FuncionarioModalProps) {
  const {
    nome,
    cargo,
    email,
    senha,
    confirmSenha,
    setNome,
    setCargo,
    setEmail,
    setSenha,
    setConfirmSenha,
    showSenha,
    setShowSenha,
    errors,
    setErrors,
    success,
    isSaving,
    isNew,
    handleSave
  } = useFuncionarioModalForm({
    data,
    onClose,
    onSave
  });
    return <PeractModal className="peract-bg-card peract-radius-lg shadow-2xl max-w-sm max-h-[90vh] overflow-y-auto" onClose={() => { if (!isSaving) onClose(); }}>
      <fieldset disabled={isSaving} className="contents" aria-busy={isSaving}>
        <div className="flex items-center justify-between p-4 border-b peract-border-color sticky top-0 peract-bg-card z-10">
          <PeractModalTitle className="peract-font-color-default">{data ? "Editar Funcionário" : "Novo Funcionário"}</PeractModalTitle>
          <PeractButtonPrimitive onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 peract-font-color-muted" variant="plain" size="plain" aria-label="Fechar"><X size={18} /></PeractButtonPrimitive>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"><CheckCircle size={16} /> Salvo!</div>}
          {errors.form && <p role="alert" className="text-sm text-red-600">{errors.form}</p>}
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">Nome completo <span className="text-red-500">*</span></PeractLabel>
            <PeractInputControl type="text" maxLength={45} value={nome} onChange={e => {
          setNome(e.target.value);
          setErrors({
            ...errors,
            nome: ""
          });
        }} placeholder="Ex: Beatriz Oliveira" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.nome ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.nome ? "#f87171" : ""} />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </PeractField>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">Cargo <span className="text-red-500">*</span></PeractLabel>
            <PeractNativeSelect value={cargo} onChange={e => setCargo(e.target.value as CargoFuncionario)} className="w-full border peract-border-color rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none" onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = ""}>
              <option value="Administrador">Administrador</option>
              <option value="Funcionário">Funcionário</option>
            </PeractNativeSelect>
          </PeractField>
          <PeractField>
            <PeractLabel className="text-sm text-gray-700 block mb-1.5">E-mail de acesso <span className="text-red-500">*</span></PeractLabel>
            <PeractInputControl type="email" maxLength={45} value={email} onChange={e => {
          setEmail(e.target.value);
          setErrors({
            ...errors,
            email: ""
          });
        }} placeholder="usuario@canalperfumado.com.br" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.email ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.email ? "#f87171" : ""} />
            {errors.email && <p role="alert" className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </PeractField>
          <div className="border peract-border-color rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b peract-border-color flex items-center gap-1.5" style={{
          background: "#fafaf9"
        }}>
              <KeyRound size={12} className="peract-font-color-muted" />
              <p className="text-xs font-medium peract-font-color-muted">
                {isNew ? "Senha de acesso" : "Alterar senha"}
                {!isNew && <span className="peract-font-color-muted font-normal ml-1">(deixe em branco para manter)</span>}
              </p>
            </div>
            <div className="p-3 flex flex-col gap-3">
              <PeractField>
                <PeractLabel className="text-xs text-gray-600 block mb-1">{isNew ? "Senha" : "Nova senha"} {isNew && <span className="text-red-500">*</span>}</PeractLabel>
                <div className="relative">
                  <PeractInputControl type={showSenha ? "text" : "password"} autoComplete="new-password" maxLength={72} value={senha} onChange={e => {
                setSenha(e.target.value);
                setErrors({
                  ...errors,
                  senha: ""
                });
              }} placeholder="Mínimo 6 caracteres" className={`w-full border rounded-lg px-3 py-2 text-sm pr-9 focus:outline-none transition-colors ${errors.senha ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.senha ? "#f87171" : ""} />
                  <PeractButtonPrimitive type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-2.5 top-1/2 -translate-y-1/2 peract-font-color-muted hover:text-gray-600" variant="plain" size="plain">
                    {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                  </PeractButtonPrimitive>
                </div>
                {errors.senha && <p className="text-xs text-red-600 mt-1">{errors.senha}</p>}
              </PeractField>
              <PeractField>
                <PeractLabel className="text-xs text-gray-600 block mb-1">Confirmar senha {isNew && <span className="text-red-500">*</span>}</PeractLabel>
                <PeractInputControl type={showSenha ? "text" : "password"} autoComplete="new-password" maxLength={72} value={confirmSenha} onChange={e => {
              setConfirmSenha(e.target.value);
              setErrors({
                ...errors,
                confirmSenha: ""
              });
            }} placeholder="Repita a senha" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.confirmSenha ? "border-red-400" : "peract-border-color"}`} onFocus={e => e.target.style.borderColor = ACC} onBlur={e => e.target.style.borderColor = errors.confirmSenha ? "#f87171" : ""} />
                {errors.confirmSenha && <p className="text-xs text-red-600 mt-1">{errors.confirmSenha}</p>}
              </PeractField>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t peract-border-color sticky bottom-0 peract-bg-card">
          <PeractButtonPrimitive onClick={onClose} className="flex-1 px-4 py-2 border peract-border-color rounded-lg text-sm text-gray-600 hover:bg-gray-50" variant="plain" size="plain">Cancelar</PeractButtonPrimitive>
          <PeractButtonPrimitive onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 peract-bg-accent" variant="plain" size="plain">{isSaving ? "Salvando..." : "Salvar"}</PeractButtonPrimitive>
        </div>
        </fieldset>
      </PeractModal>;
}
