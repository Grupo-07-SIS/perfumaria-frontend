import { Pencil, Tag, Trash2 } from "lucide-react";
import { PeractButton } from "../../../shared/components/peract-button";
import { PeractPagination } from "../../../shared/components/peract-pagination";
import { PeractTable } from "../../../shared/components/peract-table";
import type { Category, CategoryDeleteTarget, CategoryFormTarget } from "../models/categories.models";
interface CategoriesTableProps {
  categories: Category[];
  currentPage: number;
  onCreateCategory: () => void;
  onDeleteCategory: (target: CategoryDeleteTarget) => void;
  onEditCategory: (target: CategoryFormTarget) => void;
  onPageChange: (page: number) => void;
  totalCategories: number;
  totalPages: number;
}
export function CategoriesTable({
  categories,
  currentPage,
  onCreateCategory,
  onDeleteCategory,
  onEditCategory,
  onPageChange,
  totalCategories,
  totalPages
}: CategoriesTableProps) {
  return <PeractTable data={categories} emptyState={<div className="flex flex-col items-center gap-2"><Tag size={32} className="text-gray-300" /><p>Nenhuma categoria cadastrada.</p><PeractButton action={onCreateCategory} size="sm">Criar primeira categoria</PeractButton></div>} footer={<div className="flex items-center justify-between gap-4"><p className="text-xs peract-font-color-muted">{totalCategories} categorias cadastradas</p><PeractPagination currentPage={currentPage} onPageChange={onPageChange} targetSelection="categories-section" totalPages={totalPages} /></div>} header={[{
    name: "ID",
    value: "id"
  }, {
    name: "Nome da Categoria",
    value: "nome"
  }, {
    name: "Produtos vinculados",
    value: "linkedProducts"
  }, {
    name: "Ações",
    value: "actions"
  }]} renderRow={category => <tr key={category.id} className="transition-colors hover:bg-gray-50/50">
          <td className="px-4 py-3 font-mono text-sm peract-font-color-muted">#{category.id}</td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{
          background: "#FFF3E8"
        }}>
                <Tag size={12} style={{
            color: "#A67449"
          }} />
              </div>
              <span className="text-sm font-medium peract-font-color-default">{category.nome}</span>
            </div>
          </td>
          <td className="px-4 py-3"><span className="text-sm text-gray-600">{category.linkedProducts} produto(s)</span></td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <PeractButton action={() => onEditCategory({
          id: category.id,
          nome: category.nome
        })} className="h-8 w-8 peract-font-color-muted hover:bg-amber-50 hover:text-amber-700" size="icon" theme="secondary" title="Editar"><Pencil size={15} /></PeractButton>
              <PeractButton action={() => onDeleteCategory({
          id: category.id,
          linkedProducts: category.linkedProducts,
          nome: category.nome
        })} className="h-8 w-8 peract-font-color-muted hover:bg-red-50 hover:text-red-600" size="icon" theme="secondary" title="Excluir"><Trash2 size={15} /></PeractButton>
            </div>
          </td>
        </tr>} />;
}
