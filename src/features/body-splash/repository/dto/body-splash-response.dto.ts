export interface BodySplashResponseDto {
  id: number;
  produtoNome: string;
  preco10ml: number;
  preco15ml: number;
  preco20ml: number;
  preco25ml: number;
  preco30ml: number;
}

export interface BodySplashPageDto {
  content: BodySplashResponseDto[];
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface BodySplashProductDto {
  id: number;
  nome: string;
}

export interface BodySplashProductPageDto {
  content: BodySplashProductDto[];
}