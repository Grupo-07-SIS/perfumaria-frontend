import type { Endereco } from "../../models/people.models";

export interface ClienteRequestDto {
  nome: string;
  telefone: string;
  email: string;
  endereco: Endereco;
}

export interface ClienteResponseDto extends Omit<ClienteRequestDto, "endereco"> {
  endereco?: Partial<Endereco> | null;
  id: number;
  status: number;
  totalPedidos: number;
}

export interface ClientePageDto {
  content: ClienteResponseDto[];
  totalPages?: number;
}