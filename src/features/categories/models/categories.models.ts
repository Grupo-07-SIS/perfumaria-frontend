export interface Category {
  id: number;
  linkedProducts: number;
  nome: string;
}

export interface CategoryFormData {
  nome: string;
}

export interface CategoryFormTarget {
  id: number;
  nome: string;
}

export interface CategoryDeleteTarget {
  id: number;
  linkedProducts: number;
  nome: string;
}