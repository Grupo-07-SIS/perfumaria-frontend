import { AlertCircle, ChevronDown, ChevronUp, Edit3, PackageX, Ruler, Trash2 } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractPagination } from "../../../shared/components/peract-pagination";
import { PeractTable } from "../../../shared/components/peract-table";
import { PeractTag } from "../../../shared/components/peract-tag";
import type {
  ProductDeleteTarget,
  ProductFormTarget,
  ProductListItem,
  ProductSortField,
  ProductStockStatus,
} from "../models/products.models";

const statusConfig: Record<ProductStockStatus, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
  critico: { bg: "#fef3c7", color: "#92400e", icon: <AlertCircle size={12} />, label: "Crítico" },
  esgotado: { bg: "#fee2e2", color: "#991b1b", icon: <PackageX size={12} />, label: "Esgotado" },
  ok: { bg: "#dcfce7", color: "#166534", icon: <CheckCircle size={12} />, label: "OK" },
};

interface ProductsTableProps {
  currentPage: number;
  onCreateProduct: () => void;
  onDeleteProduct: (target: ProductDeleteTarget) => void;
  onEditProduct: (target: ProductFormTarget) => void;
  onPageChange: (page: number) => void;
  onSort: (field: ProductSortField) => void;
  products: ProductListItem[];
  sortAscending: boolean;
  sortField: ProductSortField;
  totalPages: number;
  totalProducts: number;
}

function SortIcon({ active, ascending }: { active: boolean; ascending: boolean }) {
  if (!active) {
    return <ChevronDown size={13} className="opacity-30" />;
  }

  return ascending ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
}

export function ProductsTable({
  currentPage,
  onCreateProduct,
  onDeleteProduct,
  onEditProduct,
  onPageChange,
  onSort,
  products,
  sortAscending,
  sortField,
  totalPages,
  totalProducts,
}: ProductsTableProps) {
  const renderActions = (product: ProductListItem) => (
    <div className="flex items-center gap-2">
      <PeractButton action={() => onEditProduct(product)} className="h-8 w-8 text-gray-400 hover:bg-amber-50 hover:text-amber-700" size="icon" theme="secondary" title="Editar"><Edit3 size={15} /></PeractButton>
      <PeractButton action={() => onDeleteProduct({ id: product.id, nome: product.nome })} className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600" size="icon" theme="secondary" title="Excluir"><Trash2 size={15} /></PeractButton>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <PeractTable
          data={products}
          emptyState={<div className="flex flex-col items-center gap-2"><PackageX size={32} className="text-gray-300" /><p>Nenhum produto encontrado.</p><PeractButton action={onCreateProduct} size="sm">Criar primeiro produto</PeractButton></div>}
          footer={<div className="flex items-center justify-between gap-4"><p className="text-xs text-gray-400">Exibindo {products.length} produtos na página</p><PeractPagination currentPage={currentPage} onPageChange={onPageChange} targetSelection="products-section" totalPages={totalPages} /></div>}
          header={[
            { name: "Produto", value: "nome", orderColumn: true },
            { name: "Marca", value: "marca", orderColumn: true },
            { name: "Categoria", value: "categoriaNome", orderColumn: true },
            { name: "Volume", value: "volume", orderColumn: true },
            { name: "Estoque", value: "estoqueAtual", orderColumn: true },
            { name: "P. Venda", value: "precoVenda", orderColumn: true },
            { name: "P. Compra", value: "precoCompra", orderColumn: true },
            { name: "Margem", value: "margem", orderColumn: true },
            { name: "Status", value: "estoqueStatus", orderColumn: true },
            { name: "Ações", value: "actions" },
          ]}
          onOrderColumn={(field) => onSort(field as ProductSortField)}
          renderHeaderLabel={(column) => column.orderColumn ? <div className="flex items-center gap-1">{column.name}<SortIcon active={sortField === column.value} ascending={sortAscending} /></div> : column.name}
          renderRow={(product) => {
            const status = statusConfig[product.estoqueStatus];

            return (
              <tr key={product.id} className="transition-colors hover:bg-gray-50/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">{product.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.marca || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3"><PeractTag>{product.categoriaNome}</PeractTag></td>
                <td className="px-4 py-3">{product.volumeLabel ? <PeractTag className="w-fit bg-blue-50 text-blue-600" icon={<Ruler size={10} />}>{product.volumeLabel}</PeractTag> : <span className="text-xs italic text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.estoqueAtual}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">R$ {product.precoVenda.toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{product.precoCompra ? `R$ ${product.precoCompra.toFixed(2)}` : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">{product.margemCalculada !== null ? <PeractTag type={product.margemCalculada >= 35 ? "success" : product.margemCalculada >= 20 ? "warning" : "alert"}>{product.margemCalculada.toFixed(1)}%</PeractTag> : <span className="text-xs text-gray-300">—</span>}</td>
                <td className="px-4 py-3"><PeractTag className="border-0" icon={status.icon} style={{ background: status.bg, color: status.color }}>{status.label}</PeractTag></td>
                <td className="px-4 py-3">{renderActions(product)}</td>
              </tr>
            );
          }}
        />
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {products.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white py-12 text-center text-sm text-gray-400">Nenhum produto encontrado.</div>
        ) : products.map((product) => {
          const status = statusConfig[product.estoqueStatus];

          return (
            <PeractCard key={product.id} className="p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.nome}</p>
                  <p className="text-xs text-gray-500">{product.marca || "Sem marca"} · {product.categoriaNome}</p>
                </div>
                <PeractTag className="shrink-0 border-0" icon={status.icon} style={{ background: status.bg, color: status.color }}>{status.label}</PeractTag>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div><p className="text-xs text-gray-400">Estoque</p><p className="text-sm font-medium text-gray-800">{product.estoqueAtual}</p></div>
                <div><p className="text-xs text-gray-400">P. Venda</p><p className="text-sm text-gray-700">R$ {product.precoVenda.toFixed(2)}</p></div>
                <div><p className="text-xs text-gray-400">P. Compra</p><p className="text-sm text-gray-700">{product.precoCompra ? `R$ ${product.precoCompra.toFixed(2)}` : "—"}</p></div>
                <div><p className="text-xs text-gray-400">Margem</p>{product.margemCalculada !== null ? <PeractTag type={product.margemCalculada >= 35 ? "success" : "warning"}>{product.margemCalculada.toFixed(1)}%</PeractTag> : <span className="text-sm text-gray-300">—</span>}</div>
                <div><p className="text-xs text-gray-400">Volume</p><p className="text-sm text-gray-700">{product.volumeLabel ?? <span className="text-xs italic text-gray-300">—</span>}</p></div>
                <div><p className="text-xs text-gray-400">Total listado</p><p className="text-sm text-gray-700">{totalProducts}</p></div>
              </div>

              <div className="mt-3 flex gap-2 border-t border-gray-50 pt-3">
                <PeractButton action={() => onEditProduct(product)} className="flex-1 text-gray-600" size="sm" theme="secondary">Editar</PeractButton>
                <PeractButton action={() => onDeleteProduct({ id: product.id, nome: product.nome })} className="border-red-200 text-red-600 hover:bg-red-50" size="sm" theme="secondary"><Trash2 size={13} /></PeractButton>
              </div>
            </PeractCard>
          );
        })}
      </div>

      <div className="mt-4 md:hidden">
        <PeractPagination currentPage={currentPage} onPageChange={onPageChange} targetSelection="products-section" totalPages={totalPages} />
      </div>
    </>
  );
}