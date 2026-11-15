import type { Endereco } from "../../models/people.models";

export interface FornecedorRequestDto {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: Endereco;
}

export interface FornecedorResponseDto extends Omit<FornecedorRequestDto, "endereco"> {
  endereco?: Partial<Endereco> | null;
  id: number;
  totalCompras?: number;
}