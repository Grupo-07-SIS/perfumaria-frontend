import type { EnderecoFieldsProps } from "../models/people.models";
import type { Endereco } from "../../../core/store/AppContext";
import { MapPin, RotateCw } from "lucide-react";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
import { UF_LIST } from "../config/people.config";
import { formatCep, onlyDigitsMax } from "../../../shared/utils/masks";

const NUMERO_MAX_DIGITS = 6;

export function EnderecoFields({
  endereco,
  onChange,
  errors,
  onClearError,
  cepLookup
}: EnderecoFieldsProps) {
  const set = (key: keyof Endereco, val: string) => onChange({
    ...endereco,
    [key]: val
  });
  return <div className="border peract-border-color rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b peract-border-color" style={{
      background: "#fafaf9"
    }}>
        <p className="text-xs font-medium peract-font-color-muted flex items-center gap-1.5">
          <MapPin size={12} /> Endereço <span className="peract-font-color-muted font-normal">(opcional)</span>
        </p>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-6 gap-3">
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">CEP</PeractLabel>
          <PeractInputControl type="text" inputMode="numeric" autoComplete="postal-code" aria-busy={cepLookup?.isLoading || undefined} value={formatCep(endereco.cep)} onChange={e => {
          set("cep", formatCep(e.target.value));
          onClearError("cep");
        }} placeholder="00000-000" maxLength={9} aria-invalid={!!errors.cep} className={`w-full border rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958] ${errors.cep ? "border-red-400" : "peract-border-color"}`} />
          {errors.cep && <p className="text-xs text-red-600 mt-1">{errors.cep}</p>}
          {cepLookup?.isLoading && <p role="status" className="text-xs peract-font-color-muted mt-1">Consultando CEP...</p>}
          {cepLookup?.message && <div className="flex items-start gap-1 mt-1">
            <p role="status" className="text-xs text-amber-700">{cepLookup.message}</p>
            <PeractButtonPrimitive onClick={cepLookup.retry} className="h-7 w-7 shrink-0 rounded-md peract-font-color-muted hover:bg-gray-100" variant="plain" size="plain" title="Consultar CEP novamente" aria-label="Consultar CEP novamente"><RotateCw size={13} /></PeractButtonPrimitive>
          </div>}
        </PeractField>
        <PeractField className="sm:col-span-4">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Logradouro</PeractLabel>
          <PeractInputControl type="text" maxLength={45} value={endereco.logradouro} aria-invalid={!!errors.logradouro} onChange={e => {
            set("logradouro", e.target.value);
            onClearError("logradouro");
          }} placeholder="Ex: Rua das Flores" className={`w-full border rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958] ${errors.logradouro ? "border-red-400" : "peract-border-color"}`} />
          {errors.logradouro && <p className="text-xs text-red-600 mt-1">{errors.logradouro}</p>}
        </PeractField>
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Número</PeractLabel>
          <PeractInputControl type="text" inputMode="numeric" value={endereco.numero} aria-invalid={!!errors.numero} onChange={e => {
            set("numero", onlyDigitsMax(e.target.value, NUMERO_MAX_DIGITS));
            onClearError("numero");
          }} placeholder="Ex: 100" maxLength={NUMERO_MAX_DIGITS} className={`w-full border rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958] ${errors.numero ? "border-red-400" : "peract-border-color"}`} />
          {errors.numero && <p className="text-xs text-red-600 mt-1">{errors.numero}</p>}
        </PeractField>
        <PeractField className="sm:col-span-4">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Complemento</PeractLabel>
          <PeractInputControl type="text" maxLength={45} value={endereco.complemento ?? ""} aria-invalid={!!errors.complemento} onChange={e => {
            set("complemento", e.target.value);
            onClearError("complemento");
          }} placeholder="Apto, sala, bloco..." className={`w-full border rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958] ${errors.complemento ? "border-red-400" : "peract-border-color"}`} />
          {errors.complemento && <p className="text-xs text-red-600 mt-1">{errors.complemento}</p>}
        </PeractField>
        <PeractField className="sm:col-span-3">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Bairro</PeractLabel>
          <PeractInputControl type="text" maxLength={45} value={endereco.bairro} aria-invalid={!!errors.bairro} onChange={e => {
            set("bairro", e.target.value);
            onClearError("bairro");
          }} placeholder="Ex: Centro" className={`w-full border rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958] ${errors.bairro ? "border-red-400" : "peract-border-color"}`} />
          {errors.bairro && <p className="text-xs text-red-600 mt-1">{errors.bairro}</p>}
        </PeractField>
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Cidade</PeractLabel>
          <PeractInputControl type="text" maxLength={45} value={endereco.cidade} aria-invalid={!!errors.cidade} onChange={e => {
            set("cidade", e.target.value);
            onClearError("cidade");
          }} placeholder="Ex: São Paulo" className={`w-full border rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958] ${errors.cidade ? "border-red-400" : "peract-border-color"}`} />
          {errors.cidade && <p className="text-xs text-red-600 mt-1">{errors.cidade}</p>}
        </PeractField>
        <PeractField className="sm:col-span-1">
          <PeractLabel className="text-xs text-gray-600 block mb-1">UF</PeractLabel>
          <PeractNativeSelect value={endereco.uf} onChange={e => set("uf", e.target.value)} className="w-full border peract-border-color rounded-lg px-2 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]">
            <option value="">—</option>
            {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </PeractNativeSelect>
        </PeractField>
      </div>
    </div>;
}
