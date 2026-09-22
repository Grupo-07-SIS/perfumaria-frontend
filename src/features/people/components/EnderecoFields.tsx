import type { EnderecoFieldsProps } from "../models/people.models";
import type { Endereco } from "../../../core/store/AppContext";
import { MapPin } from "lucide-react";
import { PeractField } from "../../../shared/components/peract-field";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractInputControl } from "../../../shared/components/peract-input";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
import { UF_LIST } from "../config/people.config";

export function EnderecoFields({
  endereco,
  onChange
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
          <PeractInputControl type="text" value={endereco.cep} onChange={e => set("cep", e.target.value)} placeholder="00000-000" maxLength={9} className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-4">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Logradouro</PeractLabel>
          <PeractInputControl type="text" value={endereco.logradouro} onChange={e => set("logradouro", e.target.value)} placeholder="Ex: Rua das Flores" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Número</PeractLabel>
          <PeractInputControl type="text" value={endereco.numero} onChange={e => set("numero", e.target.value)} placeholder="Ex: 100" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-4">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Complemento</PeractLabel>
          <PeractInputControl type="text" value={endereco.complemento ?? ""} onChange={e => set("complemento", e.target.value)} placeholder="Apto, sala, bloco..." className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-3">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Bairro</PeractLabel>
          <PeractInputControl type="text" value={endereco.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Ex: Centro" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
        </PeractField>
        <PeractField className="sm:col-span-2">
          <PeractLabel className="text-xs text-gray-600 block mb-1">Cidade</PeractLabel>
          <PeractInputControl type="text" value={endereco.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Ex: São Paulo" className="w-full border peract-border-color rounded-lg px-2.5 py-1.5 text-sm peract-font-color-default focus:outline-none focus:border-[#c29958]" />
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
