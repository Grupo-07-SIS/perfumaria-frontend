import type { CepAddress } from "../models/people.models";
import { cepRepository } from "../repository/cep.repository";
import { toCepAddress } from "../repository/mapper/cep.mapper";

export type { CepAddress } from "../models/people.models";

export async function fetchCepAddress(value: string, signal?: AbortSignal): Promise<CepAddress> {
  const cep = value.replace(/\D/g, "");
  if (cep.length !== 8) throw new Error("CEP_INVALID");
  const data = await cepRepository.findAddress(cep, signal);
  return toCepAddress(data);
}