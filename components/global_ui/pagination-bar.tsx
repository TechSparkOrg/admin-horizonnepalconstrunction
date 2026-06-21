import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageRange(page: number, totalPages: number): (number | "ellipsis")[] {
  const siblingCount = 1;
  const totalVisible = siblingCount * 2 + 5; // first, last, current, 2 siblings, 2 ellipses

  if (totalPages <= totalVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: (number | "ellipsis")[] = [1];

  if (showLeftEllipsis) pages.push("ellipsis");
  else for (let p = 2; p < leftSibling; p++) pages.push(p);

  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== totalPages) pages.push(p);
  }

  if (showRightEllipsis) pages.push("ellipsis");
  else for (let p = rightSibling + 1; p < totalPages; p++) pages.push(p);

  pages.push(totalPages);

  return pages;
}

export function PaginationBar({ page, totalPages, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages);

  return (
    <div className="mt-6 flex justify-center">
      <Pagination className="w-auto mx-0">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page !== 1 && onPageChange(page - 1)}
              className={
                page === 1
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer rounded-lg border-gray-200 hover:bg-gray-50"
              }
            />
          </PaginationItem>

          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis className="text-gray-400" />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => onPageChange(p)}
                  className={
                    p === page
                      ? "cursor-pointer rounded-lg bg-sidebar-primary text-white hover:bg-sidebar-primary/90 hover:text-white border-transparent"
                      : "cursor-pointer rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
                  }
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => page !== totalPages && onPageChange(page + 1)}
              className={
                page === totalPages
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer rounded-lg border-gray-200 hover:bg-gray-50"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}