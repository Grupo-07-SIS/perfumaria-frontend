import type { Endereco } from "../../models/people.models";

export interface ClienteRequestDto {
  nome: string;
  telefone: string;
  email: string;
  endereco: Endereco;
}

export interface ClienteResponseDto extends ClienteRequestDto {
  id: number;
  status: number;
  totalPedidos: number;
}

export interface ClientePageDto {
  content: ClienteResponseDto[];
}