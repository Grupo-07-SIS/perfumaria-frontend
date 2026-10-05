import {
  PeractPaginationRoot as Pagination,
  PeractPaginationContent as PaginationContent,
  PeractPaginationItem as PaginationItem,
} from "./PeractPaginationPrimitives";
import { PeractButton } from "../peract-button";
import type { PeractPaginationProps } from "./PeractPagination.types";

function createPages(totalPages: number) {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
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
      <PaginationContent>
        <PaginationItem>
          <PeractButton
            action={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            size="sm"
            theme="secondary"
          >
            Anterior
          </PeractButton>
        </PaginationItem>
        {createPages(totalPages).map((page) => (
          <PaginationItem key={page}>
            <PeractButton
              action={() => handlePageChange(page)}
              className={currentPage === page ? "border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] text-white" : "text-gray-600"}
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