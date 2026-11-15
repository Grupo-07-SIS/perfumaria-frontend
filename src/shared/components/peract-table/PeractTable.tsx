import { PeractCard } from "../peract-card";
import type { PeractTableData, PeractTableProps } from "./PeractTable.types";
export function PeractTable<TData extends PeractTableData>({
  data,
  emptyState,
  footer,
  header,
  maxRows,
  onOrderColumn,
  renderHeaderLabel,
  renderRow
}: PeractTableProps<TData>) {
  const visibleRows = maxRows ? data.slice(0, maxRows) : data;
  return <PeractCard className="overflow-hidden shadow-sm">
      <div className="overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="peract-bg-secondary">
              {header.map(column => <th key={String(column.value)} className="px-4 py-3 text-left text-xs font-medium peract-font-color-muted">
                  {column.orderColumn && onOrderColumn ? <button className="flex items-center gap-1 whitespace-nowrap text-left hover:text-gray-800" onClick={() => onOrderColumn(column.value)} type="button">
                      {renderHeaderLabel ? renderHeaderLabel(column) : column.name}
                    </button> : <span className="whitespace-nowrap">{renderHeaderLabel ? renderHeaderLabel(column) : column.name}</span>}
                </th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleRows.length === 0 ? <tr>
                <td className="px-4 py-12 text-center text-sm peract-font-color-muted" colSpan={header.length}>
                  {emptyState}
                </td>
              </tr> : visibleRows.map(renderRow)}
          </tbody>
        </table>
      </div>
      {footer ? <div className="border-t border-gray-50 px-4 py-3">{footer}</div> : null}
    </PeractCard>;
}
