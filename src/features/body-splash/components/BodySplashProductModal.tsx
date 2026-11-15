import { useState } from "react";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import type { BodySplashCategoryOption, BodySplashNewProductForm } from "../models/body-splash.models";

interface BodySplashProductModalProps {
  categories: BodySplashCategoryOption[];
  onClose: () => void;
  onSave: (values: BodySplashNewProductForm) => Promise<void>;
}

const INITIAL_VALUES: BodySplashNewProductForm = {
  categoriaId: "",
  estoqueAtual: "0",
  marca: "",
  nome: "",
  precoVenda: "",
  volume: "",
};

export function BodySplashProductModal({ categories, onClose, onSave }: BodySplashProductModalProps) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSave(values);
    } catch {
      setError("Não foi possível cadastrar o Body Splash.");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key: keyof BodySplashNewProductForm, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
  };

  return (
    <PeractModal className="max-w-lg peract-radius-lg peract-bg-card p-5 shadow-2xl" onClose={onClose}>
      <PeractModalTitle className="peract-font-color-default">Novo Body Splash</PeractModalTitle>
      <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input className="rounded-lg border peract-border-color px-3 py-2" onChange={event => update("nome", event.target.value)} required value={values.nome} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Marca
          <input className="rounded-lg border peract-border-color px-3 py-2" onChange={event => update("marca", event.target.value)} value={values.marca} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Família olfativa
          <select className="rounded-lg border peract-border-color px-3 py-2" onChange={event => update("categoriaId", event.target.value)} required value={values.categoriaId}>
            <option value="">Selecione uma família</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.nome}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Preço de venda
            <input className="rounded-lg border peract-border-color px-3 py-2" min="0.01" onChange={event => update("precoVenda", event.target.value)} required step="0.01" type="number" value={values.precoVenda} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Estoque
            <input className="rounded-lg border peract-border-color px-3 py-2" min="0" onChange={event => update("estoqueAtual", event.target.value)} required step="1" type="number" value={values.estoqueAtual} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Volume em ml (opcional)
          <input className="rounded-lg border peract-border-color px-3 py-2" min="0" onChange={event => update("volume", event.target.value)} step="0.01" type="number" value={values.volume} />
        </label>
        <div className="flex justify-end gap-2">
          <PeractButton action={onClose} theme="secondary">Cancelar</PeractButton>
          <PeractButton disabled={submitting || categories.length === 0} type="submit">{submitting ? "Salvando..." : "Cadastrar Body Splash"}</PeractButton>
        </div>
      </form>
    </PeractModal>
  );
}
