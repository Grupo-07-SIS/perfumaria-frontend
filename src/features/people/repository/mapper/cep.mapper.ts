import { UF_LIST } from "../../config/people.config";
import type { CepAddress } from "../../models/people.models";
import type { CepResponseDto } from "../dto/cep-response.dto";

export function toCepAddress(data: CepResponseDto): CepAddress {
  if (data?.erro === true || data?.erro === "true") throw new Error("CEP_NOT_FOUND");
  if (!data || typeof data.localidade !== "string" || !data.localidade.trim()
    || typeof data.uf !== "string" || !UF_LIST.includes(data.uf)) {
    throw new Error("CEP_INVALID_RESPONSE");
  }
  return {
    logradouro: typeof data.logradouro === "string" ? data.logradouro.trim() : "",
    bairro: typeof data.bairro === "string" ? data.bairro.trim() : "",
    cidade: data.localidade.trim(),
    uf: data.uf,
  };
}