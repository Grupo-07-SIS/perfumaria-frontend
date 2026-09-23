import type { BodySplashModalFormValues, BodySplashItem } from "../models/body-splash.models";
import { VOLUMES } from "../config/body-splash.config";
import { bodySplashRepository } from "../repository/body-splash.repository";
import { toBodySplashModel, toBodySplashProductOption, toBodySplashRequestDto } from "../repository/mapper/body-splash.mapper";

export function validateBodySplash({
  produtoId,
  precos
}: BodySplashModalFormValues) {
  if (!produtoId) return "Selecione um Body Splash.";
  if (!VOLUMES.every(volume => precos[volume.key] && parseFloat(precos[volume.key]) > 0)) {
    return "Preencha todos os preços.";
  }
  return "";
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export async function fetchBodySplashCatalog() {
  const [page, productsPage] = await Promise.all([
    bodySplashRepository.listBodySplashes(),
    bodySplashRepository.listProducts(),
  ]);
  const productOptions = productsPage.content
    .map(toBodySplashProductOption)
    .sort((left, right) => left.nome.localeCompare(right.nome));
  return {
    page: {
      ...page,
      content: page.content.map(dto => {
        const product = productOptions.find(option => normalizeName(option.nome) === normalizeName(dto.produtoNome));
        return toBodySplashModel(dto, product?.id);
      }),
    },
    productOptions,
  };
}

export async function createBodySplash(values: BodySplashModalFormValues) {
  const request = toBodySplashRequestDto(values);
  return toBodySplashModel(await bodySplashRepository.createBodySplash(request), request.produtoId);
}

export async function updateBodySplash(item: BodySplashItem, values: BodySplashModalFormValues) {
  const request = toBodySplashRequestDto(values);
  return toBodySplashModel(await bodySplashRepository.updateBodySplash(item.id, request), request.produtoId);
}

export async function removeBodySplash(item: BodySplashItem) {
  await bodySplashRepository.deleteBodySplash(item.id);
  return item.id;
}
export function exportCSV(items: BodySplashItem[]) {
  const headers = ["ID", "Body Splash", "10ml", "15ml", "20ml", "25ml", "30ml"];
  const rows = items.map(d => [d.id, d.produto, d.preco10ml.toFixed(2), d.preco15ml.toFixed(2), d.preco20ml.toFixed(2), d.preco25ml.toFixed(2), d.preco30ml.toFixed(2)]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tabela-bodysplash.csv";
  a.click();
  URL.revokeObjectURL(url);
}
