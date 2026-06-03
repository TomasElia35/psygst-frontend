import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, setPage }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-4 py-4 mt-2 border-t border-[var(--border)]">
            <button
                className="btn btn-ghost px-3 py-1.5 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
            >
                <ChevronLeft size={16} /> Anterior
            </button>
            
            <span className="text-sm text-[var(--text-secondary)] font-medium">
                Página {page + 1} de {totalPages}
            </span>
            
            <button
                className="btn btn-ghost px-3 py-1.5 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
            >
                Siguiente <ChevronRight size={16} />
            </button>
        </div>
    );
}
