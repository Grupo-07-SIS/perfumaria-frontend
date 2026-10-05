import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { Search } from "lucide-react";
import { PeractCard } from "../../../shared/components/peract-card";
import { PeractChip } from "../../../shared/components/peract-chip";
import { PeractInput } from "../../../shared/components/peract-input";
import { PeractSelect } from "../../../shared/components/peract-select";
import { PRODUCT_STATUS_OPTIONS } from "../config/products.config";
import type { ProductStatusFilter } from "../models/products.models";
interface ProductsFiltersProps {
  categoryTabs: Array<{
    id: string;
    nome: string;
  }>;
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
  statusFilter
}: ProductsFiltersProps) {
  return <>
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {categoryTabs.map(category => <PeractChip key={category.id} actionFilter={value => onCategoryChange(String(value))} data={{
        selected: selectedCategory === category.id,
        value: category.id
      }}>{category.nome}</PeractChip>)}
      </div>

      <PeractCard className="mb-4 flex flex-col gap-3 p-3 shadow-sm sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border peract-border-color px-3 py-2">
          <PeractButtonPrimitive aria-label="Buscar produtos" className="shrink-0 peract-font-color-muted transition-colors hover:text-gray-700" onClick={onSearchSubmit} type="button" variant="plain" size="plain">
            <Search size={15} />
          </PeractButtonPrimitive>
          <PeractInput aria-label="Buscar por nome ou marca" className="border-0 bg-transparent px-0 py-0 shadow-none" onValueChange={onSearchChange} onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearchSubmit();
          }
        }} placeholder="Buscar por nome ou marca..." type="text" value={search} />
        </div>

        <div className="sm:w-44">
          <PeractSelect data={PRODUCT_STATUS_OPTIONS} onValueChange={onStatusChange} value={statusFilter}><span className="sr-only">Status do estoque</span></PeractSelect>
        </div>
      </PeractCard>
    </>;
}
