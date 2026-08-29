import { useEffect, useState } from "react";
import {
  Search, Plus, Edit3, ChevronUp, ChevronDown, X, CheckCircle,
  AlertCircle, Trash2, PackageX, Ruler, TrendingUp,
} from "lucide-react";
import { useApp, Product, StockStatus } from "../context/AppContext";
import { PeractButton } from "../../shared/components/peract-button";
import { PeractCard } from "../../shared/components/peract-card";
import { PeractChip } from "../../shared/components/peract-chip";
import { PeractInput } from "../../shared/components/peract-input";
import { PeractModalAction } from "../../shared/components/peract-modal-action";
import { PeractPagination } from "../../shared/components/peract-pagination";
import { PeractSelect } from "../../shared/components/peract-select";
import { PeractTag } from "../../shared/components/peract-tag";
import { PeractTable } from "../../shared/components/peract-table";

const statusConfig: Record<StockStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ok:       { label: "OK",       color: "#166534", bg: "#dcfce7", icon: <CheckCircle size={12} /> },
  critico:  { label: "Crítico",  color: "#92400e", bg: "#fef3c7", icon: <AlertCircle size={12} /> },
  esgotado: { label: "Esgotado", color: "#991b1b", bg: "#fee2e2", icon: <PackageX size={12} /> },
};

const UNIDADES = ["ml", "L", "g", "kg", "oz", "un"];

interface ProductModalProps {
  product?: Product;
  categories: string[];
  onClose: () => void;
  onSave: (data: Omit<Product, "id" | "status">) => void;
}

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? (categories[0] ?? ""));
  const [stock, setStock] = useState(String(product?.currentStock ?? "0"));
  const [preco, setPreco] = useState(product ? String(product.preco) : "");
  const [precoCompra, setPrecoCompra] = useState(product?.precoCompra ? String(product.precoCompra) : "");

  const [hasVolume, setHasVolume] = useState(!!(product?.volume));
  const [volumeVal, setVolumeVal] = useState(product?.volume ? String(product.volume) : "");
  const [tipoMedida, setTipoMedida] = useState(product?.tipoMedida ?? "ml");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const precoNum = parseFloat(preco) || 0;
  const precoCompraNum = parseFloat(precoCompra) || 0;
  const margem = precoNum > 0 && precoCompraNum > 0
    ? ((precoNum - precoCompraNum) / precoNum) * 100
    : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Obrigatório.";
    if (!preco || parseFloat(preco) <= 0) e.preco = "Informe um preço válido.";
    if (parseInt(stock) < 0 || isNaN(parseInt(stock))) e.stock = "Qtd. inválida.";
    if (hasVolume && (!volumeVal || parseFloat(volumeVal) <= 0)) e.volume = "Informe um volume válido.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    export { ProductsPage as EstoqueProdutos } from "../../features/products/pages/ProductsPage";
    setSuccess(true);
