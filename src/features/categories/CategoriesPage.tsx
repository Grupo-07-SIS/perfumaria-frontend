import { Plus } from "lucide-react";
import { PeractButton } from "../../shared/components/peract-button";
import { CategoryFormModal } from "./components/CategoryFormModal";
import { CategoriesTable } from "./components/CategoriesTable";
import { CategorySummaryCards } from "./components/CategorySummaryCards";
import { DeleteCategoryModal } from "./components/DeleteCategoryModal";
import { useCategoriesFacade } from "./facade/useCategoriesFacade";

export function CategoriesPage() {
  const facade = useCategoriesFacade();

  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6" id="categories-section">
      {facade.isFormOpen ? (
        <CategoryFormModal
          defaultValues={facade.formTarget ? { nome: facade.formTarget.nome } : undefined}
          onClose={facade.closeForm}
          onSave={facade.submitCategory}
          submitting={facade.isSubmitting}
          title={facade.formTarget ? "Editar Categoria" : "Nova Categoria"}
        />
      ) : null}

      {facade.deleteTarget ? (
        <DeleteCategoryModal
          linkedProducts={facade.deleteTarget.linkedProducts}
          nome={facade.deleteTarget.nome}
          onClose={facade.closeDeleteConfirm}
          onConfirm={() => void facade.confirmDelete()}
        />
      ) : null}

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[#26221E]">Categorias</h1>
          <nav className="mt-0.5 text-xs text-gray-400">Estoque &rsaquo; <span className="text-[#A67449]">Categorias</span></nav>
        </div>
        <PeractButton action={facade.openCreateForm} className="self-start" icon={<Plus size={16} />}>Nova Categoria</PeractButton>
      </div>

      {facade.error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {facade.error}
        </div>
      ) : null}

      <CategorySummaryCards categories={facade.categories} />

      <CategoriesTable
        categories={facade.paginatedCategories}
        currentPage={facade.currentPage}
        onCreateCategory={facade.openCreateForm}
        onDeleteCategory={facade.openDeleteConfirm}
        onEditCategory={facade.openEditForm}
        onPageChange={facade.setCurrentPage}
        totalCategories={facade.categories.length}
        totalPages={facade.totalPages}
      />

      {facade.isLoading ? <p className="mt-4 text-sm text-gray-400">Carregando categorias...</p> : null}
    </div>
  );
}