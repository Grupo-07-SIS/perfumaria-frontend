export interface Decant {
  id: number;
  perfume: string;
  preco2ml: number;
  preco3ml: number;
  preco5ml: number;
  preco10ml: number;
}
export interface DecantModalProps {
  onClose: () => void;
  onSave: (d: Omit<Decant, "id">) => void;
  edit?: Decant;
}
export interface DecantModalFormValues {
  perfume: string;
  preco2ml: string;
  preco3ml: string;
  preco5ml: string;
  preco10ml: string;
}
