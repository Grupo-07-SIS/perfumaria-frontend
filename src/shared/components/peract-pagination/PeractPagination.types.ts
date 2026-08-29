export interface PeractPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  targetSelection?: string;
  totalPages: number;
}