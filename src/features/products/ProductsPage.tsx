import { AlertCircle, Plus } from "lucide-react";
import { PeractButton } from "../../shared/components/peract-button";
import { DeleteProductModal } from "./components/DeleteProductModal";
import { ProductFormModal } from "./components/ProductFormModal";
import { ProductsFilters } from "./components/ProductsFilters";
import { ProductsTable } from "./components/ProductsTable";
import { useProductsFacade } from "./facade/useProductsFacade";

function getDefaultFormValues(product: NonNullable<ReturnType<typeof useProductsFacade>["formTarget"]>) {
  return {
    categoriaId: String(product.categoriaId),
    estoqueAtual: String(product.estoqueAtual),
    hasVolume: Boolean(product.volume && product.medida),
    marca: product.marca,
    medida: product.medida ?? "ML",
    nome: product.nome,
    precoCompra: product.precoCompra ? String(product.precoCompra) : "",
    precoVenda: String(product.precoVenda),
    volume: product.volume ? String(product.volume) : "",
  } as const;
}

export function ProductsPage() {
  const facade = useProductsFacade();

  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6" id="products-section">
      {facade.isFormOpen ? (
        <ProductFormModal
          categories={facade.categoryOptions}
          defaultValues={facade.formTarget ? getDefaultFormValues(facade.formTarget) : undefined}
          onClose={facade.closeForm}
          onSave={facade.submitProduct}
          submitting={facade.isSubmitting}
          title={facade.formTarget ? "Editar Produto" : "Novo Produto"}
        />
      ) : null}

      {facade.deleteTarget ? (
        <DeleteProductModal
          nome={facade.deleteTarget.nome}
          onClose={facade.closeDeleteConfirm}
          onConfirm={() => void facade.confirmDelete()}
          submitting={facade.isDeleteSubmitting}
        />
      ) : null}

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[#26221E]">Estoque – Produtos</h1>
          <nav className="mt-0.5 text-xs text-gray-400">Estoque &rsaquo; <span className="text-[#A67449]">Produtos</span></nav>
        </div>
        <PeractButton action={facade.openCreateForm} className="self-start" icon={<Plus size={16} />}>Novo produto</PeractButton>
      </div>

      {facade.error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {facade.error}
        </div>
      ) : null}

      <div className="mb-4 flex w-fit items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs text-gray-400 shadow-sm">
        <AlertCircle size={13} className="text-amber-500" />
        Status Crítico: estoque ≤ <strong className="mx-1 text-gray-600">{facade.criticalThreshold}</strong> · Esgotado quando = 0
      </div>

      <ProductsFilters
        categoryTabs={facade.categoryTabs}
        onCategoryChange={facade.setSelectedCategory}
        onSearchChange={facade.setSearch}
        onSearchSubmit={() => void facade.submitSearch()}
        onStatusChange={facade.setStatusFilter}
        search={facade.search}
        selectedCategory={facade.selectedCategory}
        statusFilter={facade.statusFilter}
      />

      <ProductsTable
        currentPage={facade.currentPage}
        onCreateProduct={facade.openCreateForm}
        onDeleteProduct={facade.openDeleteConfirm}
        onEditProduct={facade.openEditForm}
        onPageChange={facade.setCurrentPage}
        onSort={facade.toggleSort}
        products={facade.paginatedProducts}
        sortAscending={facade.sortAscending}
        sortField={facade.sortField}
        totalPages={facade.totalPages}
        totalProducts={facade.filteredProductsCount}
      />

      {facade.isLoading ? <p className="mt-4 text-sm text-gray-400">Carregando produtos...</p> : null}
    </div>
  );
}