import { useEffect, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination<Item>(items: Item[], pageSize = DEFAULT_PAGE_SIZE) {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const firstItem = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, items.length);

  useEffect(() => {
    if (requestedPage !== currentPage) setRequestedPage(currentPage);
  }, [requestedPage, currentPage]);

  const setCurrentPage = (page: number) => {
    if (Number.isInteger(page)) setRequestedPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    firstItem,
    lastItem,
    totalItems: items.length,
    paginatedItems: items.slice(firstItem === 0 ? 0 : firstItem - 1, lastItem),
  };
}