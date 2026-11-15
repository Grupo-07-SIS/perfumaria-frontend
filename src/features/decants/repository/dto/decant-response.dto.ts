export interface DecantResponseDto {
  id: number;
  perfumeId: number;
  perfumeNome: string;
  preco2ml: number;
  preco3ml: number;
  preco5ml: number;
  preco10ml: number;
}

export interface DecantPageDto {
  content: DecantResponseDto[];
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PerfumeProductDto {
  id: number;
  nome: string;
}

export interface PerfumeProductPageDto {
  content: PerfumeProductDto[];
}