import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

interface CustomPaginationProps extends HTMLAttributes<HTMLDivElement> {
  currentPage?: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

const CustomPagination: FC<CustomPaginationProps> = ({
  currentPage = 1,
  totalPages = 0,
  ...props
}) => {
  if (totalPages === 0) {
    return;
  }

  return (
    <Pagination className={cn("mt-8", props.className)}>
      <PaginationContent>
        {currentPage !== 1 && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => props.setCurrentPage(currentPage - 1)}
            />
          </PaginationItem>
        )}

        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => props.setCurrentPage(1)}>
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {currentPage > 3 && <PaginationEllipsis />}

        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => props.setCurrentPage(currentPage - 1)}
            >
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationLink isActive>{currentPage}</PaginationLink>
        </PaginationItem>

        {totalPages - currentPage > 0 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => props.setCurrentPage(currentPage + 1)}
            >
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {totalPages - currentPage > 2 && <PaginationEllipsis />}

        {totalPages - currentPage > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => props.setCurrentPage(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {currentPage !== totalPages && (
          <PaginationItem>
            <PaginationNext
              onClick={() => props.setCurrentPage(currentPage + 1)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;
