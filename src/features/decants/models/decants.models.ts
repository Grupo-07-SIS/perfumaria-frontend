export interface Decant {
  id: number;
  perfumeId: number;
  perfume: string;
  preco2ml: number;
  preco3ml: number;
  preco5ml: number;
  preco10ml: number;
}
export interface PerfumeOption {
  id: number;
  nome: string;
}
export interface DecantModalProps {
  onClose: () => void;
  onSave: (values: DecantModalFormValues) => Promise<void>;
  perfumeOptions: PerfumeOption[];
  edit?: Decant;
}
export interface DecantModalFormValues {
  perfumeId: string;
  preco2ml: string;
  preco3ml: string;
  preco5ml: string;
  preco10ml: string;
}
