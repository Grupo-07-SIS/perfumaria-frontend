import { PeractField } from "../../../shared/components/peract-field";
import { PeractInput, PeractInputControl } from "../../../shared/components/peract-input";
import { PeractLabel } from "../../../shared/components/peract-label";
import { PeractModal, PeractModalTitle } from "../../../shared/components/peract-modal";
import { CheckCircle, Ruler, TrendingUp, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractSelect } from "../../../shared/components/peract-select";
import { PeractAlert } from "../../../shared/components/peract-alert";
import { PRODUCT_MEASURE_OPTIONS } from "../config/products.config";
import type { ProductCategoryOption, ProductFormData } from "../models/products.models";
interface ProductFormModalProps {
  categories: ProductCategoryOption[];
  defaultValues?: ProductFormData;
  onClose: () => void;
  onSave: (formData: ProductFormData) => Promise<void>;
  submitting: boolean;
  title: string;
}
const DEFAULT_FORM_VALUES: ProductFormData = {
  categoriaId: "",
  estoqueAtual: "0",
  hasVolume: false,
  marca: "",
  medida: "ML",
  nome: "",
  precoCompra: "",
  precoVenda: "",
  volume: ""
};
function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}
export function ProductFormModal({
  categories,
  defaultValues,
  onClose,
  onSave,
  submitting,
  title
}: ProductFormModalProps) {
  const [success, setSuccess] = useState(false);
  const {
    control,
    formState: {
      errors
    },
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors
  } = useForm<ProductFormData>({
    defaultValues: defaultValues ?? {
      ...DEFAULT_FORM_VALUES,
      categoriaId: categories[0] ? String(categories[0].id) : ""
    }
  });
  const watchedSalePrice = useWatch({
    control,
    name: "precoVenda"
  });
  const watchedPurchasePrice = useWatch({
    control,
    name: "precoCompra"
  });
  const watchedHasVolume = useWatch({
    control,
    name: "hasVolume"
  });
  const watchedVolume = useWatch({
    control,
    name: "volume"
  });
  const watchedMeasure = useWatch({
    control,
    name: "medida"
  });
  useEffect(() => {
    reset(defaultValues ?? {
      ...DEFAULT_FORM_VALUES,
      categoriaId: categories[0] ? String(categories[0].id) : ""
    });
    setSuccess(false);
  }, [categories, defaultValues, reset]);
  const submitForm = handleSubmit(async formData => {
    clearErrors("root");
    try {
      await onSave({
        ...formData,
        nome: formData.nome.trim(),
        marca: formData.marca.trim(),
        precoCompra: formData.precoCompra.trim(),
        precoVenda: formData.precoVenda.trim(),
        volume: formData.volume.trim()
      });
      setSuccess(true);
      window.setTimeout(onClose, 1200);
    } catch {
      setError("root", { message: "Não foi possível salvar o produto." });
    }
  });
  const salePrice = watchedSalePrice ? parseDecimal(watchedSalePrice) : 0;
  const purchasePrice = watchedPurchasePrice ? parseDecimal(watchedPurchasePrice) : 0;
  const margin = salePrice > 0 && purchasePrice > 0 ? (salePrice - purchasePrice) / salePrice * 100 : null;
  const volumePreview = watchedHasVolume && watchedVolume ? `${watchedVolume}${watchedMeasure === "UNIDADE" ? "un" : watchedMeasure.toLowerCase()}` : null;
  return <PeractModal className="max-h-[90vh] max-w-lg overflow-y-auto peract-radius-lg peract-bg-card shadow-2xl" onClose={onClose}>
        <div className="sticky top-0 flex items-center justify-between border-b peract-border-color peract-bg-card p-4">
          <PeractModalTitle className="peract-font-color-default">{title}</PeractModalTitle>
          <PeractButton aria-label="Fechar" action={onClose} className="h-8 w-8 rounded-lg peract-font-color-muted hover:bg-gray-100" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>

        <form className="flex flex-col gap-4 p-4" onSubmit={submitForm}>
          {errors.root?.message ? <PeractAlert variant="destructive">{errors.root.message}</PeractAlert> : null}
          {success ? <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
              <CheckCircle size={16} /> Produto salvo com sucesso!
            </div> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Controller control={control} name="nome" rules={{
            required: "O nome do produto é obrigatório."
          }} render={({
            field
          }) => <PeractInput autoFocus errorText={errors.nome?.message} onValueChange={field.onChange} placeholder="Ex: Chanel N°5" required type="text" validation={errors.nome ? "invalid" : "non-validation"} value={field.value}>Nome do produto</PeractInput>} />
            </div>

            <Controller control={control} name="marca" render={({
          field
        }) => <PeractInput onValueChange={field.onChange} placeholder="Ex: Chanel" type="text" value={field.value}>Marca</PeractInput>} />

            <Controller control={control} name="categoriaId" rules={{
          required: "A categoria do produto é obrigatória."
        }} render={({
          field
        }) => <PeractSelect data={categories.map(category => ({
          name: category.nome,
          value: String(category.id)
        }))} errorText={errors.categoriaId?.message} onValueChange={field.onChange} placeholder="Selecione uma categoria" required validation={errors.categoriaId ? "invalid" : "non-validation"} value={field.value}>Categoria</PeractSelect>} />

            <Controller control={control} name="estoqueAtual" rules={{
          required: "O estoque atual é obrigatório.",
          validate: value => Number(value) >= 0 || "Qtd. inválida."
        }} render={({
          field
        }) => <PeractInput errorText={errors.estoqueAtual?.message} onValueChange={field.onChange} required type="number" validation={errors.estoqueAtual ? "invalid" : "non-validation"} value={field.value}>Estoque atual</PeractInput>} />

            <Controller control={control} name="precoVenda" rules={{
          required: "O preço de venda é obrigatório.",
          validate: value => parseDecimal(value) > 0 || "Informe um preço válido."
        }} render={({
          field
        }) => <PeractInput errorText={errors.precoVenda?.message} onValueChange={field.onChange} placeholder="0,00" required type="number" validation={errors.precoVenda ? "invalid" : "non-validation"} value={field.value}>Preço de venda (R$)</PeractInput>} />

            <Controller control={control} name="precoCompra" rules={{
          validate: value => !value || parseDecimal(value) >= 0 || "Informe um custo válido."
        }} render={({
          field
        }) => <PeractInput errorText={errors.precoCompra?.message} onValueChange={field.onChange} placeholder="0,00" type="number" validation={errors.precoCompra ? "invalid" : "non-validation"} value={field.value}>Preço de compra (R$)</PeractInput>} />

            {margin !== null ? <div className="sm:col-span-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{
          background: margin >= 30 ? "#f0fdf4" : "#fef3c7",
          color: margin >= 30 ? "#166534" : "#92400e"
        }}>
                <TrendingUp size={12} />
                Margem de lucro estimada: <strong>{margin.toFixed(1)}%</strong>
                {margin < 20 ? " · Margem baixa" : null}
              </div> : null}
          </div>

          <PeractField className="overflow-hidden rounded-xl border peract-border-color">
            <PeractLabel className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50">
              <div className="relative">
                <PeractInputControl checked={watchedHasVolume} className="sr-only" onChange={event => {
              setValue("hasVolume", event.target.checked, {
                shouldDirty: true
              });
              if (!event.target.checked) {
                setValue("volume", "", {
                  shouldDirty: true,
                  shouldValidate: true
                });
              }
            }} type="checkbox" />
                <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${watchedHasVolume ? "border-[#A67449] bg-[#A67449]" : "border-gray-300 peract-bg-card"}`}>
                  {watchedHasVolume ? <CheckCircle size={12} className="text-white" /> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler size={14} className="peract-font-color-muted" />
                <span className="text-sm text-gray-700">Deseja inserir volume</span>
              </div>
            </PeractLabel>
            {watchedHasVolume ? <div className="flex flex-col gap-3 border-t peract-border-color bg-[#FAFAFA] px-4 pb-4 pt-2">
                <p className="text-xs peract-font-color-muted">Informe a capacidade do produto e a unidade de medida</p>
                <div className="grid grid-cols-2 gap-3">
                  <Controller control={control} name="volume" rules={{
              validate: value => !watchedHasVolume || parseDecimal(value) > 0 || "Informe um volume válido."
            }} render={({
              field
            }) => <PeractInput errorText={errors.volume?.message} onValueChange={field.onChange} placeholder="Ex: 200" required={watchedHasVolume} type="number" validation={errors.volume ? "invalid" : "non-validation"} value={field.value}>Capacidade</PeractInput>} />

                  <Controller control={control} name="medida" render={({
              field
            }) => <PeractSelect data={PRODUCT_MEASURE_OPTIONS} onValueChange={field.onChange} required value={field.value}>Tipo de medida</PeractSelect>} />
                </div>

                {volumePreview ? <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-[#A67449]">
                    <Ruler size={11} /> Volume exibido: <strong>{volumePreview}</strong>
                  </div> : null}
              </div> : null}
          </PeractField>

          <div className="flex gap-2 border-t peract-border-color pt-4">
            <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary" type="button">Cancelar</PeractButton>
            <PeractButton className="flex-1" disabled={submitting} type="submit">
              {submitting ? "Salvando..." : "Salvar"}
            </PeractButton>
          </div>
        </form>
      </PeractModal>;
}
