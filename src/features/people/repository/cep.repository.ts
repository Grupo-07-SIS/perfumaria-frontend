import axios from "axios";
import type { CepResponseDto } from "./dto/cep-response.dto";

export const cepRepository = {
  async findAddress(cep: string, signal?: AbortSignal): Promise<CepResponseDto> {
    const { data } = await axios.get<CepResponseDto>(`https://viacep.com.br/ws/${cep}/json/`, {
      signal,
      timeout: 5000,
      withCredentials: false,
    });
    return data;
  },
};