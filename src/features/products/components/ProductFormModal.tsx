import { CheckCircle, Ruler, TrendingUp, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractSelect } from "../../../shared/components/peract-select";
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
  volume: "",
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
  title,
}: ProductFormModalProps) {
  const [success, setSuccess] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: defaultValues ?? {
      ...DEFAULT_FORM_VALUES,
      categoriaId: categories[0] ? String(categories[0].id) : "",
    },
  });

  const watchedSalePrice = useWatch({ control, name: "precoVenda" });
  const watchedPurchasePrice = useWatch({ control, name: "precoCompra" });
  const watchedHasVolume = useWatch({ control, name: "hasVolume" });
  const watchedVolume = useWatch({ control, name: "volume" });
  const watchedMeasure = useWatch({ control, name: "medida" });

  useEffect(() => {
    reset(defaultValues ?? {
      ...DEFAULT_FORM_VALUES,
      categoriaId: categories[0] ? String(categories[0].id) : "",
    });
    setSuccess(false);
  }, [categories, defaultValues, reset]);

  const submitForm = handleSubmit(async (formData) => {
    await onSave({
      ...formData,
      nome: formData.nome.trim(),
      marca: formData.marca.trim(),
      precoCompra: formData.precoCompra.trim(),
      precoVenda: formData.precoVenda.trim(),
      volume: formData.volume.trim(),
    });
    setSuccess(true);
    window.setTimeout(onClose, 1200);
  });

  const salePrice = watchedSalePrice ? parseDecimal(watchedSalePrice) : 0;
  const purchasePrice = watchedPurchasePrice ? parseDecimal(watchedPurchasePrice) : 0;
  const margin = salePrice > 0 && purchasePrice > 0 ? ((salePrice - purchasePrice) / salePrice) * 100 : null;
  const volumePreview = watchedHasVolume && watchedVolume
    ? `${watchedVolume}${watchedMeasure === "UNIDADE" ? "un" : watchedMeasure.toLowerCase()}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white p-4">
          <h3 className="text-[#26221E]">{title}</h3>
          <PeractButton action={onClose} className="h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>

        <form className="flex flex-col gap-4 p-4" onSubmit={submitForm}>
          {success ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
              <CheckCircle size={16} /> Produto salvo com sucesso!
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Controller
                control={control}
                name="nome"
                rules={{ required: "O nome do produto é obrigatório." }}
                render={({ field }) => (
                  <PeractInput
                    autoFocus
                    errorText={errors.nome?.message}
                    label="Nome do produto"
                    onValueChange={field.onChange}
                    placeholder="Ex: Chanel N°5"
                    required
                    type="text"
                    validation={errors.nome ? "invalid" : "non-validation"}
                    value={field.value}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="marca"
              render={({ field }) => (
                <PeractInput
                  label="Marca"
                  onValueChange={field.onChange}
                  placeholder="Ex: Chanel"
                  type="text"
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="categoriaId"
              rules={{ required: "A categoria do produto é obrigatória." }}
              render={({ field }) => (
                <PeractSelect
                  data={categories.map((category) => ({ name: category.nome, value: String(category.id) }))}
                  errorText={errors.categoriaId?.message}
                  label="Categoria"
                  onValueChange={field.onChange}
                  placeholder="Selecione uma categoria"
                  required
                  validation={errors.categoriaId ? "invalid" : "non-validation"}
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="estoqueAtual"
              rules={{
                required: "O estoque atual é obrigatório.",
                validate: (value) => Number(value) >= 0 || "Qtd. inválida.",
              }}
              render={({ field }) => (
                <PeractInput
                  errorText={errors.estoqueAtual?.message}
                  label="Estoque atual"
                  onValueChange={field.onChange}
                  required
                  type="number"
                  validation={errors.estoqueAtual ? "invalid" : "non-validation"}
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="precoVenda"
              rules={{
                required: "O preço de venda é obrigatório.",
                validate: (value) => parseDecimal(value) > 0 || "Informe um preço válido.",
              }}
              render={({ field }) => (
                <PeractInput
                  errorText={errors.precoVenda?.message}
                  label="Preço de venda (R$)"
                  onValueChange={field.onChange}
                  placeholder="0,00"
                  required
                  type="number"
                  validation={errors.precoVenda ? "invalid" : "non-validation"}
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="precoCompra"
              rules={{
                validate: (value) => !value || parseDecimal(value) >= 0 || "Informe um custo válido.",
              }}
              render={({ field }) => (
                <PeractInput
                  errorText={errors.precoCompra?.message}
                  label="Preço de compra (R$)"
                  onValueChange={field.onChange}
                  placeholder="0,00"
                  type="number"
                  validation={errors.precoCompra ? "invalid" : "non-validation"}
                  value={field.value}
                />
              )}
            />

            {margin !== null ? (
              <div className="sm:col-span-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: margin >= 30 ? "#f0fdf4" : "#fef3c7", color: margin >= 30 ? "#166534" : "#92400e" }}>
                <TrendingUp size={12} />
                Margem de lucro estimada: <strong>{margin.toFixed(1)}%</strong>
                {margin < 20 ? " · Margem baixa" : null}
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50">
              <div className="relative">
                <input
                  checked={watchedHasVolume}
                  className="sr-only"
                  onChange={(event) => {
                    setValue("hasVolume", event.target.checked, { shouldDirty: true });

                    if (!event.target.checked) {
                      setValue("volume", "", { shouldDirty: true, shouldValidate: true });
                    }
                  }}
                  type="checkbox"
                />
                <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${watchedHasVolume ? "border-[#A67449] bg-[#A67449]" : "border-gray-300 bg-white"}`}>
                  {watchedHasVolume ? <CheckCircle size={12} className="text-white" /> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">Deseja inserir volume</span>
              </div>
            </label>
            {watchedHasVolume ? (
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#FAFAFA] px-4 pb-4 pt-2">
                <p className="text-xs text-gray-400">Informe a capacidade do produto e a unidade de medida</p>
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    control={control}
                    name="volume"
                    rules={{
                      validate: (value) => !watchedHasVolume || parseDecimal(value) > 0 || "Informe um volume válido.",
                    }}
                    render={({ field }) => (
                      <PeractInput
                        errorText={errors.volume?.message}
                        label="Capacidade"
                        onValueChange={field.onChange}
                        placeholder="Ex: 200"
                        required={watchedHasVolume}
                        type="number"
                        validation={errors.volume ? "invalid" : "non-validation"}
                        value={field.value}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="medida"
                    render={({ field }) => (
                      <PeractSelect
                        data={PRODUCT_MEASURE_OPTIONS}
                        label="Tipo de medida"
                        onValueChange={field.onChange}
                        required
                        value={field.value}
                      />
                    )}
                  />
                </div>

                {volumePreview ? (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-[#A67449]">
                    <Ruler size={11} /> Volume exibido: <strong>{volumePreview}</strong>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 border-t border-gray-100 pt-4">
            <PeractButton action={onClose} className="flex-1 text-gray-600" theme="secondary" type="button">Cancelar</PeractButton>
            <PeractButton className="flex-1" disabled={submitting} type="submit">
              {submitting ? "Salvando..." : "Salvar"}
            </PeractButton>
          </div>
        </form>
      </div>
    </div>
  );
}