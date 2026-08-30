import { Search } from "lucide-react";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractChip } from "../../../shared/components/peract-chip";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractSelect } from "../../../shared/components/peract-select";
import { PRODUCT_STATUS_OPTIONS } from "../config/products.config";
import type { ProductStatusFilter } from "../models/products.models";

interface ProductsFiltersProps {
  categoryTabs: Array<{ id: string; nome: string }>;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onStatusChange: (value: ProductStatusFilter) => void;
  search: string;
  selectedCategory: string;
  statusFilter: ProductStatusFilter;
}

export function ProductsFilters({
  categoryTabs,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  onStatusChange,
  search,
  selectedCategory,
  statusFilter,
}: ProductsFiltersProps) {
  return (
    <>
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {categoryTabs.map((category) => (
          <PeractChip
            key={category.id}
            actionFilter={(value) => onCategoryChange(String(value))}
            data={{
              label: category.nome,
              selected: selectedCategory === category.id,
              value: category.id,
            }}
          />
        ))}
      </div>

      <PeractCard className="mb-4 flex flex-col gap-3 p-3 shadow-sm sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
          <button aria-label="Buscar produtos" className="shrink-0 text-gray-400 transition-colors hover:text-gray-700" onClick={onSearchSubmit} type="button">
            <Search size={15} />
          </button>
          <PeractInput
            className="border-0 bg-transparent px-0 py-0 shadow-none"
            onValueChange={onSearchChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearchSubmit();
              }
            }}
            placeholder="Buscar por nome ou marca..."
            type="text"
            value={search}
          />
        </div>

        <div className="sm:w-44">
          <PeractSelect data={PRODUCT_STATUS_OPTIONS} onValueChange={onStatusChange} value={statusFilter} />
        </div>
      </PeractCard>
    </>
  );
}