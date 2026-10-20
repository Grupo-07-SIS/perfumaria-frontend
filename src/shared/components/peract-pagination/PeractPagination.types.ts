import type { ReactNode } from "react";

export interface PeractPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  targetSelection?: string;
  totalPages: number;
}

export interface PeractPaginationFooterProps extends PeractPaginationProps {
  firstItem: number;
  lastItem: number;
  totalItems: number;
  children: ReactNode;
  className?: string;
}