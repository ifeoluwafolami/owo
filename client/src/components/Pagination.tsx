import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({ page, totalItems, pageSize, onPageChange, className = "" }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) return null;

    const currentPage = Math.min(Math.max(page, 1), totalPages);
    return <nav className={`flex items-center justify-between gap-3 ${className}`} aria-label="Pagination">
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="inline-flex h-8 items-center gap-1 rounded-lg border border-current/20 px-2 text-xs font-semibold transition hover:bg-current/10 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm" aria-label="Previous page">
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
        </button>
        {/* <p className="text-sm font-semibold tabular-nums opacity-65">{currentPage}/{totalPages}</p> */}
        <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex h-8 items-center gap-1 rounded-lg border border-current/20 px-2 text-xs font-semibold transition hover:bg-current/10 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm" aria-label="Next page">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
        </button>
    </nav>;
}
