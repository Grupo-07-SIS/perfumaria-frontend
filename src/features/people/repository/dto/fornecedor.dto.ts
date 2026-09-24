import type { Endereco } from "../../models/people.models";

export interface FornecedorRequestDto {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: Endereco;
}

export interface FornecedorResponseDto extends FornecedorRequestDto {
  id: number;
  totalCompras?: number;
}