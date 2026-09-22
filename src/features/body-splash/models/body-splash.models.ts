export interface BodySplashItem {
  id: number;
  produto: string; // body splash product name (e.g. "Lavanda & Ylang")
  preco10ml: number;
  preco15ml: number;
  preco20ml: number;
  preco25ml: number;
  preco30ml: number;
}
export interface ModalProps {
  onClose: () => void;
  onSave: (d: Omit<BodySplashItem, "id">) => void;
  edit?: BodySplashItem;
}
export interface BodySplashModalFormValues {
  produto: string;
  precos: Record<string, string>;
}
