export interface BodySplashItem {
  id: number;
  produtoId?: number;
  produto: string; // body splash product name (e.g. "Lavanda & Ylang")
  preco10ml: number;
  preco15ml: number;
  preco20ml: number;
  preco25ml: number;
  preco30ml: number;
}
export interface BodySplashProductOption {
  id: number;
  nome: string;
}

export interface BodySplashCategoryOption {
  id: number;
  nome: string;
}

export interface BodySplashNewProductForm {
  categoriaId: string;
  estoqueAtual: string;
  marca: string;
  nome: string;
  precoVenda: string;
  volume: string;
}
export interface ModalProps {
  onClose: () => void;
  onSave: (values: BodySplashModalFormValues) => Promise<void>;
  productOptions: BodySplashProductOption[];
  edit?: BodySplashItem;
}
export interface BodySplashModalFormValues {
  produtoId: string;
  precos: Record<string, string>;
}
