import type { DecantModalFormValues, Decant } from "../models/decants.models";
import { decantsRepository } from "../repository/decants.repository";
import { toDecantModel, toDecantRequestDto, toPerfumeOption } from "../repository/mapper/decant.mapper";
import { serializeCsv } from "../../../shared/utils/csv";

export const DECANT_ALREADY_LINKED = "Este perfume já possui um vínculo de decant. Edite o registro existente.";

export function validateDecant(values: DecantModalFormValues) {
  if (!values.perfumeId) return "Selecione um perfume.";
  if (!values.preco2ml || !values.preco3ml || !values.preco5ml || !values.preco10ml) {
    return "Preencha todos os preços.";
  }
  return "";
}

export async function fetchDecants(params: { page?: number; size?: number; perfumeId?: number; busca?: string } = {}) {
  const page = await decantsRepository.listDecants(params);
  return { ...page, content: page.content.map(toDecantModel) };
}

export async function fetchPerfumeOptions() {
  const page = await decantsRepository.listPerfumeProducts();
  return page.content.map(toPerfumeOption).sort((left, right) => left.nome.localeCompare(right.nome));
}

export async function createDecant(values: DecantModalFormValues) {
  const request = toDecantRequestDto(values);
  const existing = await decantsRepository.listDecants({ perfumeId: request.perfumeId, page: 0, size: 1 });
  if (existing.totalElements > 0 || existing.content.length > 0) throw new Error(DECANT_ALREADY_LINKED);
  try {
    return toDecantModel(await decantsRepository.createDecant(request));
  } catch (error) {
    if (error instanceof Error && error.message === "DECANTS_CREATE_FAILED:409") throw new Error(DECANT_ALREADY_LINKED);
    throw error;
  }
}

export async function updateDecant(decant: Decant, values: DecantModalFormValues) {
  return toDecantModel(await decantsRepository.updateDecant(decant.id, toDecantRequestDto(values)));
}

export async function removeDecant(decant: Decant) {
  await decantsRepository.deleteDecant(decant.id);
  return decant.id;
}
export function exportCSV(decants: Decant[]) {
  const headers = ["ID", "Perfume", "Preço 2ml", "Preço 3ml", "Preço 5ml", "Preço 10ml"];
  const rows = decants.map(d => [d.id, d.perfume, d.preco2ml.toFixed(2), d.preco3ml.toFixed(2), d.preco5ml.toFixed(2), d.preco10ml.toFixed(2)]);
  const csv = serializeCsv([headers, ...rows]);
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tabela-decants.csv";
  a.click();
  URL.revokeObjectURL(url);
}
