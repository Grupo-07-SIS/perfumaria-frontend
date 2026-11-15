import {
  PeractPaginationRoot as Pagination,
  PeractPaginationContent as PaginationContent,
  PeractPaginationItem as PaginationItem,
} from "./PeractPaginationPrimitives";
import { PeractButton } from "../peract-button";
import type { PeractPaginationFooterProps, PeractPaginationProps } from "./PeractPagination.types";

function createPages(currentPage: number, totalPages: number) {
  const visibleCount = Math.min(4, totalPages);
  const firstPage = Math.max(1, Math.min(currentPage - 1, totalPages - visibleCount + 1));
  return Array.from({ length: visibleCount }, (_, index) => firstPage + index);
}

export function PeractPagination({ currentPage, onPageChange, targetSelection, totalPages }: PeractPaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    onPageChange(page);

    if (targetSelection) {
      document.getElementById(targetSelection)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Pagination className="justify-end">
      <PaginationContent className="flex-wrap justify-end">
        <PaginationItem>
          <PeractButton
            action={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-9 min-h-9 px-3 py-1"
            size="sm"
            theme="secondary"
          >
            Anterior
          </PeractButton>
        </PaginationItem>
        {createPages(currentPage, totalPages).map((page) => (
          <PaginationItem key={page}>
            <PeractButton
              action={() => handlePageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`h-9 min-h-9 min-w-9 px-2 py-1 ${currentPage === page ? "border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] text-white" : "text-gray-600"}`}
              size="sm"
              theme={currentPage === page ? "primary" : "secondary"}
            >
              {page}
            </PeractButton>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PeractButton
            action={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-9 min-h-9 px-3 py-1"
            size="sm"
            theme="secondary"
          >
            Próxima
          </PeractButton>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function PeractPaginationFooter({ firstItem, lastItem, totalItems, children, className, ...pagination }: PeractPaginationFooterProps) {
  return <div className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}>
    <p className="text-xs peract-font-color-muted">Exibindo {firstItem} a {lastItem} de {totalItems} {children}</p>
    <PeractPagination {...pagination} />
  </div>;
}