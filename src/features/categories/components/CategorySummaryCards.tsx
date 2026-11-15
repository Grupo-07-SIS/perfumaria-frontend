import { Tag } from "lucide-react";
import { PeractCard } from "../../../shared/components/peract-card";
import type { Category } from "../models/categories.models";
interface CategorySummaryCardsProps {
  categories: Category[];
}
export function CategorySummaryCards({
  categories
}: CategorySummaryCardsProps) {
  return <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {categories.map(category => <PeractCard key={category.id} className="flex items-center gap-3 p-3 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{
        background: "#FFF3E8"
      }}>
            <Tag size={16} style={{
          color: "#A67449"
        }} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium peract-font-color-default">{category.nome}</p>
            <p className="text-xs peract-font-color-muted">{category.linkedProducts} produto(s)</p>
          </div>
        </PeractCard>)}
    </div>;
}
